import { msearchRequest } from './httpClient';
import { Ad, AdsResponse } from '../types/ad';
import { FilterState } from '../types/filter';

const PAGE_SIZE = 12;

const buildAdsQuery = (filters: Partial<FilterState>, from = 0) => {
  const must: any[] = [];

  if (filters.categoryExternalID) {
    must.push({
      term: { 'category.externalID': filters.categoryExternalID },
    });
  }

  if (filters.locationExternalID && filters.locationExternalID !== '0-1') {
    must.push({
      term: { 'location.externalID': filters.locationExternalID },
    });
  }

  if (filters.condition) {
    must.push({
      term: { 'extraFields.condition': filters.condition },
    });
  }

  if (filters.dynamicFilters) {
    Object.entries(filters.dynamicFilters).forEach(([key, value]) => {
      if (value) {
        must.push({ term: { [`extraFields.${key}`]: value } });
      }
    });
  }

  const priceFilter: any = {};
  if (filters.priceMin !== undefined) priceFilter.gte = filters.priceMin;
  if (filters.priceMax !== undefined) priceFilter.lte = filters.priceMax;
  if (Object.keys(priceFilter).length > 0) {
    must.push({ range: { price: priceFilter } });
  }

  if (filters.query && filters.query.trim()) {
    must.push({
      multi_match: {
        query: filters.query.trim(),
        fields: ['title^2', 'description'],
        type: 'best_fields',
        fuzziness: 'AUTO',
      },
    });
  }

  let sort: any[] = [
    { timestamp: { order: 'desc' } },
    { id: { order: 'desc' } },
  ];
  if (filters.sortBy === 'price_asc') {
    sort = [{ price: { order: 'asc' } }];
  } else if (filters.sortBy === 'price_desc') {
    sort = [{ price: { order: 'desc' } }];
  }

  const queryBody: any = {
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
  return {
    id: hit._id ?? String(Math.random()),
    title: src.title ?? '',
    price: src.price ?? undefined,
    currency: src.currency ?? 'USD',
    images: Array.isArray(src.images)
      ? src.images.map((img: any) => ({
          id: img.id ?? '',
          url: img.url ?? '',
        }))
      : [],
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
    extraFields: src.extraFields ?? {},
  };
};

export const fetchAds = async (
  filters: Partial<FilterState>,
  page = 0,
): Promise<AdsResponse> => {
  const from = page * PAGE_SIZE;
  const ndjson = buildAdsQuery(filters, from);
  
  console.log('Fetching ads with query:', ndjson); // ← add this
  
  const data = await msearchRequest(ndjson);
  
  console.log('API response:', JSON.stringify(data).slice(0, 500)); // ← add this
  
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