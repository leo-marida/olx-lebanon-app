import { msearchRequest } from './httpClient';
import { Ad, AdsResponse } from '../types/ad';
import { FilterState } from '../types/filter';

const PAGE_SIZE = 12;

const buildAdsQuery = (filters: Partial<FilterState>, from = 0) => {
  const must: any[] = [];

  // Category filter
  if (filters.categoryExternalID && filters.categoryExternalID !== '') {
    must.push({
      term: { 'category.externalID': filters.categoryExternalID },
    });
  }

  // Location filter
  if (
    filters.locationExternalID &&
    filters.locationExternalID !== '' &&
    filters.locationExternalID !== '0-1'
  ) {
    must.push({
      term: { 'location.externalID': filters.locationExternalID },
    });
  }

  // Text search
if (filters.query && filters.query.trim() !== '') {
  must.push({
    bool: {
      should: [
        {
          multi_match: {
            query: filters.query.trim(),
            fields: ['title^3', 'description^1'],
            type: 'best_fields',
            fuzziness: 'AUTO',
          },
        },
        {
          multi_match: {
            query: filters.query.trim(),
            fields: ['title^3', 'description^1'],
            type: 'phrase_prefix',
          },
        },
      ],
      minimum_should_match: 1,
    },
  });
}

  // Price range
  const priceFilter: any = {};
  if (filters.priceMin !== undefined && filters.priceMin > 0) {
    priceFilter.gte = filters.priceMin;
  }
  if (filters.priceMax !== undefined && filters.priceMax > 0) {
    priceFilter.lte = filters.priceMax;
  }
  if (Object.keys(priceFilter).length > 0) {
    must.push({ range: { price: priceFilter } });
  }

  // Condition filter
  if (filters.condition) {
    must.push({
      nested: {
        path: 'extraFields',
        query: {
          bool: {
            must: [
              { match: { 'extraFields.key': 'condition' } },
              { match: { 'extraFields.value': filters.condition } },
            ],
          },
        },
      },
    });
  }

  // Dynamic filters
  if (filters.dynamicFilters) {
    Object.entries(filters.dynamicFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        must.push({
          nested: {
            path: 'extraFields',
            query: {
              bool: {
                must: [
                  { match: { 'extraFields.key': key } },
                  { match: { 'extraFields.value': String(value) } },
                ],
              },
            },
          },
        });
      }
    });
  }

  // Sort
  let sort: any[] = [
    { timestamp: { order: 'desc' } },
    { id: { order: 'desc' } },
  ];
  if (filters.sortBy === 'price_asc') {
    sort = [{ price: { order: 'asc' } }, { id: { order: 'desc' } }];
  } else if (filters.sortBy === 'price_desc') {
    sort = [{ price: { order: 'desc' } }, { id: { order: 'desc' } }];
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
  return {
    id: hit._id ?? `ad-${Date.now()}-${Math.random()}`,
    title: src.title ?? '',
    price: src.price ?? undefined,
    currency: src.currency ?? 'USD',
    images: Array.isArray(src.images)
      ? src.images.map((img: any) => ({
          id: img.id ?? String(Math.random()),
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