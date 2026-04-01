import { msearchRequest } from "./httpClient";
import { Ad, AdsResponse } from "../types/ad";
import { FilterState } from "../types/filter";

const PAGE_SIZE = 12;

const CATEGORY_SYNONYMS: Record<string, string[]> = {
  "23": [
    "car",
    "cars",
    "vehicle",
    "vehicles",
    "auto",
    "سيارة",
    "سيارات",
    "automobile",
  ],
  "198": [
    "phone",
    "phones",
    "mobile",
    "mobiles",
    "iphone",
    "samsung",
    "هاتف",
    "موبايل",
    "جوال",
  ],
  "2": [
    "apartment",
    "apartments",
    "villa",
    "villas",
    "property",
    "house",
    "flat",
    "شقة",
    "فيلا",
    "عقار",
    "بيت",
  ],
  "96": ["laptop", "computer", "pc", "لابتوب", "كمبيوتر"],
  "3": ["furniture", "sofa", "chair", "table", "أثاث", "كنبة"],
  "4": ["fashion", "clothes", "clothing", "shoes", "ملابس", "أزياء"],
  "7": ["job", "jobs", "work", "hiring", "وظيفة", "عمل", "توظيف"],
};

const findMatchingCategoryIDs = (query: string): string[] => {
  const q = query.toLowerCase().trim();
  return Object.entries(CATEGORY_SYNONYMS)
    .filter(([, synonyms]) =>
      synonyms.some((syn) => syn.includes(q) || q.includes(syn)),
    )
    .map(([catID]) => catID);
};

const buildAdsQuery = (filters: Partial<FilterState>, from = 0) => {
  const must: any[] = [];
  const q = filters.query?.trim() ?? "";

  // Category
  if (filters.categoryExternalID && filters.categoryExternalID !== "") {
    must.push({ term: { "category.externalID": filters.categoryExternalID } });
  }

  // Location
  if (
    filters.locationExternalID &&
    filters.locationExternalID !== "" &&
    filters.locationExternalID !== "0-1"
  ) {
    must.push({ term: { "location.externalID": filters.locationExternalID } });
  }

  // Price
  if (
    (filters.priceMin !== undefined && filters.priceMin > 0) ||
    (filters.priceMax !== undefined && filters.priceMax > 0)
  ) {
    const priceFilter: any = {};
    if (filters.priceMin && filters.priceMin > 0)
      priceFilter.gte = filters.priceMin;
    if (filters.priceMax && filters.priceMax > 0)
      priceFilter.lte = filters.priceMax;
    must.push({ range: { "extraFields.price": priceFilter } });
  }

  // Condition
  if (filters.condition) {
    must.push({
      term: { "extraFields.new_used": filters.condition === "new" ? "1" : "2" },
    });
  }

  // Dynamic filters
  if (filters.dynamicFilters) {
    Object.entries(filters.dynamicFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && key !== "highlighted") {
        must.push({ term: { [`extraFields.${key}`]: String(value) } });
      }
    });
  }

  if (q !== "") {
    const matchingCategoryIDs = findMatchingCategoryIDs(q);
    const shouldClauses: any[] = [
      // keyword field — pre-indexed for search
      { match: { keywords: { query: q, boost: 8 } } },
      // title starts with
      { match_phrase_prefix: { title: { query: q, boost: 6 } } },
      { match_phrase_prefix: { title_l1: { query: q, boost: 6 } } },
      // title contains word
      { match: { title: { query: q, fuzziness: "1", boost: 4 } } },
      { match: { title_l1: { query: q, fuzziness: "1", boost: 4 } } },
      // slug often contains make/model
      { match_phrase_prefix: { slug: { query: q, boost: 3 } } },
    ];

    if (matchingCategoryIDs.length > 0 && !filters.categoryExternalID) {
    // User typed a category word like "car" "phone" "apartment"
    // Filter by those categories directly
    must.push({
      terms: { 'category.externalID': matchingCategoryIDs },
    });
  } else {
    // User typed a specific item name — search in titles
    must.push({
      bool: {
        should: [
          { match_phrase_prefix: { title: { query: q, boost: 6 } } },
          { match_phrase_prefix: { title_l1: { query: q, boost: 6 } } },
          { match: { title: { query: q, fuzziness: 'AUTO', boost: 4 } } },
          { match: { title_l1: { query: q, fuzziness: 'AUTO', boost: 4 } } },
          { match: { keywords: { query: q, boost: 3 } } },
        ],
        minimum_should_match: 1,
      },
    });
  }
}
  // Sort
  let sort: any[];
  if (q !== "") {
    sort = [{ _score: { order: "desc" } }, { timestamp: { order: "desc" } }];
  } else if (filters.sortBy === "price_asc") {
    sort = [{ price: { order: "asc" } }];
  } else if (filters.sortBy === "price_desc") {
    sort = [{ price: { order: "desc" } }];
  } else {
    sort = [{ timestamp: { order: "desc" } }, { id: { order: "desc" } }];
  }

  const queryBody = {
    from,
    size: PAGE_SIZE,
    track_total_hits: 200000,
    query: { bool: { must: must.length > 0 ? must : [{ match_all: {} }] } },
    sort,
  };

  const ndjson =
    `${JSON.stringify({ index: "olx-lb-production-ads-en" })}\n` +
    `${JSON.stringify(queryBody)}\n`;

  //console.log("SENDING QUERY:", JSON.stringify(queryBody).slice(0, 600));

  return ndjson;
  // return `${JSON.stringify({ index: "olx-lb-production-ads-en" })}\n${JSON.stringify(
  //   {
  //     from,
  //     size: PAGE_SIZE,
  //     track_total_hits: 200000,
  //     query: { bool: { must: must.length > 0 ? must : [{ match_all: {} }] } },
  //     sort,
  //   },
  // )}\n`;
};

const buildImageUrl = (id: number, externalID: string): string => {
  if (id) {
    return `https://images.olx.com.lb/thumbnails/${id}-800x600.webp`;
  }
  if (externalID) {
    return `https://images.olx.com.lb/thumbnails/${externalID}-800x600.webp`;
  }
  return '';
};

const mapHit = (hit: any): Ad => {
  const src = hit._source ?? {};
  const extraFields: Record<string, any> = src.extraFields ?? {};

  const photos = src.photos ?? [];
  const images = Array.isArray(photos)
    ? photos
        .sort((a: any, b: any) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
        .map((p: any) => ({
          id: String(p.id ?? Math.random()),
          url: buildImageUrl(p.id, p.externalID ?? ""),
        }))
        .filter((img: any) => img.url !== '')
    : [];

  // Fallback to coverPhoto
  if (images.length === 0 && src.coverPhoto) {
    images.push({
      id: String(src.coverPhoto.id ?? 'cover'),
      url: buildImageUrl(src.coverPhoto.id, src.coverPhoto.externalID ?? ''),
    });
  }

  const mappedExtraFields: Record<string, any> = { ...extraFields };
  if (extraFields.new_used !== undefined) {
    mappedExtraFields.condition =
      String(extraFields.new_used) === "1" ? "New" : "Used";
  }
  if (extraFields.mileage !== undefined) {
    mappedExtraFields.kilometers = extraFields.mileage;
  }
  if (extraFields.petrol) mappedExtraFields.fuel = extraFields.petrol;
  if (extraFields.make) mappedExtraFields.brand = extraFields.make;
//  console.log("AD PRICE:", src.price, "TITLE:", src.title?.slice(0, 30));
  // console.log(
  //   "EXTRA FIELDS FULL:",
  //   JSON.stringify(src.extraFields).slice(0, 400),
  // );
  // console.log("PRODUCT INFO:", JSON.stringify(src.productInfo).slice(0, 200));
  // console.log("CONTACT INFO:", JSON.stringify(src.contactInfo).slice(0, 200));
  return {
    id: hit._id ?? `ad-${Math.random()}`,
    title: src.title ?? "",
    price: src.price ?? undefined,
    currency: src.extraFields?.price ?? src.price ?? undefined,
    images,
    location: {
      externalID: src.location?.externalID ?? "",
      name: src.location?.name ?? "",
    },
    category: {
      externalID: src.category?.externalID ?? "",
      name: src.category?.name ?? "",
    },
    timestamp: src.timestamp ?? 0,
    isElite: src.isElite ?? false,
    isHighlighted: src.isHighlighted ?? false,
    extraFields: mappedExtraFields,
  };
};

export const fetchAds = async (
  filters: Partial<FilterState>,
  page = 0,
): Promise<AdsResponse> => {
  const from = page * PAGE_SIZE;
  const ndjson = buildAdsQuery(filters, from);
  const data = await msearchRequest(ndjson);
  const response = data.responses?.[0];
  const hits = response?.hits?.hits ?? [];
  const total = response?.hits?.total?.value ?? 0;

//  console.log("SEARCH RESPONSE total:", total, "hits:", hits.length);
  if (hits.length > 0) {
    console.log("FIRST HIT TITLE:", hits[0]._source?.title);
  }
  return { hits: hits.map(mapHit), total };
};

export const fetchFeaturedAds = async (
  categoryExternalID: string,
): Promise<Ad[]> => {
  try {
    const result = await fetchAds({ categoryExternalID }, 0);
    return result.hits.slice(0, 6);
  } catch (error) {
    console.error("fetchFeaturedAds error:", error);
    return [];
  }
};
