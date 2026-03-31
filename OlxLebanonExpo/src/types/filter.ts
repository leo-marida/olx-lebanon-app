export interface FilterState {
  query: string;
  categoryExternalID: string;
  locationExternalID: string;
  priceMin?: number;
  priceMax?: number;
  condition?: 'new' | 'used';
  dynamicFilters: Record<string, string | number>;
  sortBy: 'timestamp' | 'price_asc' | 'price_desc';
  page: number;
}