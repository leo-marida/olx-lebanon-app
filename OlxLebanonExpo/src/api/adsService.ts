import { msearchRequest } from './httpClient';
import { Ad, AdsResponse } from '../types/ad';
import { FilterState } from '../types/filter';

const PAGE_SIZE = 12;

// Build OLX image URL from photo externalID
const buildImageUrl = (externalID: string): string => {
  if (!externalID) return '';
  return `https://apollo-ireland.akamaized.net/v1/files/${externalID}/image;s=761x1000`;
};

const buildAdsQuery = (filters: Partial<FilterState>, from = 0) => {
  const must: any[] = [];

  // Category
  if (filters.categoryExternalID && filters.categoryExternalID !== '') {
    must.push({
      term: { 'category.externalID': filters.categoryExternalID },
    });
  }

  // Location
  if (
    filters.locationExternalID &&
    filters.locationExternalID !== '' &&
    filters.locationExternalID !== '0-1'
  ) {
    must.push({
      term: { 'location.externalID': filters.locationExternalID },
    });
  }

  // Price range — field is 'price' directly on source
  if (
    (filters.priceMin !== undefined && filters.priceMin > 0) ||
    (filters.priceMax !== undefined && filters.priceMax > 0)
  ) {
    const priceFilter: any = {};
    if (filters.priceMin !== undefined && filters.priceMin > 0) {
      priceFilter.gte = filters.priceMin;
    }
    if (filters.priceMax !== undefined && filters.priceMax > 0) {
      priceFilter.lte = filters.priceMax;
    }
    must.push({ range: { price: priceFilter } });
  }

  // Condition — actual field is 'new_used' in extraFields
  // 1 = new, 2 = used based on OLX data
  if (filters.condition) {
    const conditionValue = filters.condition === 'new' ? '1' : '2';
    must.push({
      term: { 'extraFields.new_used': conditionValue },
    });
  }

  // Dynamic filters from categoryFields API
  if (filters.dynamicFilters) {
    Object.entries(filters.dynamicFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && key !== 'highlighted') {
        must.push({
          term: { [`extraFields.${key}`]: String(value) },
        });
      }
    });
  }

  // Text search — searches title and title_l1 (Arabic)
  const q = filters.query?.trim();
  if (q && q !== '') {
    must.push({
      bool: {
        should: [
          {
            match_phrase_prefix: {
              title: { query: q, boost: 5 },
            },
          },
          {
            match_phrase_prefix: {
              title_l1: { query: q, boost: 5 },
            },
          },
          {
            match: {
              title: { query: q, fuzziness: 'AUTO', boost: 3 },
            },
          },
          {
            match: {
              title_l1: { query: q, fuzziness: 'AUTO', boost: 3 },
            },
          },
          {
            match: {
              description: { query: q, fuzziness: 'AUTO', boost: 1 },
            },
          },
          {
            match: {
              description_l1: { query: q, fuzziness: 'AUTO', boost: 1 },
            },
          },
        ],
        minimum_should_match: 1,
      },
    });
  }

  // Sort
  let sort: any[];
  if (q && q !== '') {
    sort = [{ _score: { order: 'desc' } }, { timestamp: { order: 'desc' } }];
  } else if (filters.sortBy === 'price_asc') {
    sort = [{ price: { order: 'asc' } }];
  } else if (filters.sortBy === 'price_desc') {
    sort = [{ price: { order: 'desc' } }];
  } else {
    sort = [{ timestamp: { order: 'desc' } }, { id: { order: 'desc' } }];
  }

  const queryBody = {
    from,
    size: PAGE_SIZE,
    track_total_hits: 200000,
    query: {
      bool: {
        must: must.length > 0 ? must : [{ match_all: {} }],
      },
    },
    sort,
  };

  const header = JSON.stringify({ index: 'olx-lb-production-ads-en' });
  const body = JSON.stringify(queryBody);
  return `${header}\n${body}\n`;
};

const mapHit = (hit: any): Ad => {
  const src = hit._source ?? {};

  // extraFields is a flat object like { make: "77", year: 2025, new_used: "1" }
  const extraFields: Record<string, any> = src.extraFields ?? {};

  // Photos come from 'photos' array with externalID
  const photos = src.photos ?? src.images ?? [];
  const images = Array.isArray(photos)
    ? photos
        .sort((a: any, b: any) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
        .map((p: any) => ({
          id: String(p.id ?? p.externalID ?? Math.random()),
          url: buildImageUrl(p.externalID ?? ''),
        }))
        .filter((img: any) => img.url !== '')
    : [];

  // Also try coverPhoto as fallback
  const coverPhoto = src.coverPhoto;
  if (images.length === 0 && coverPhoto?.externalID) {
    images.push({
      id: String(coverPhoto.id ?? 'cover'),
      url: buildImageUrl(coverPhoto.externalID),
    });
  }

  // Map extraFields to readable values
  const mappedExtraFields: Record<string, any> = { ...extraFields };

  // Normalize condition: new_used 1 = new, 2 = used
  if (extraFields.new_used) {
    mappedExtraFields.condition =
      extraFields.new_used === '1' || extraFields.new_used === 1
        ? 'New'
        : 'Used';
  }

  // Normalize mileage field name
  if (extraFields.mileage !== undefined) {
    mappedExtraFields.kilometers = extraFields.mileage;
  }

  // Normalize fuel/petrol
  if (extraFields.petrol) {
    mappedExtraFields.fuel = extraFields.petrol;
  }

  // Normalize brand/make
  if (extraFields.make) {
    mappedExtraFields.brand = extraFields.make;
  }

  return {
    id: hit._id ?? `ad-${Math.random()}`,
    title: src.title ?? '',
    price: src.price ?? undefined,
    currency: src.currency ?? 'USD',
    images,
    location: {
      externalID: src.location?.externalID ?? '',
      name: src.location?.name ?? '',
    },
    category: {
      externalID: src.category?.externalID ?? '',
      name: src.category?.name ?? '',
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

  return {
    hits: hits.map(mapHit),
    total,
  };
};

export const fetchFeaturedAds = async (
  categoryExternalID: string,
): Promise<Ad[]> => {
  try {
    const result = await fetchAds({ categoryExternalID }, 0);
    return result.hits.slice(0, 6);
  } catch (error) {
    console.error('fetchFeaturedAds error:', error);
    return [];
  }
};