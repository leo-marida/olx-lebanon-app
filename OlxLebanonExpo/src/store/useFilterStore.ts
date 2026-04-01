import { create } from 'zustand';
import { FilterState } from '../types/filter';

interface FilterStore {
  filters: FilterState;
  setQuery: (query: string) => void;
  setCategoryExternalID: (id: string) => void;
  setLocationExternalID: (id: string) => void;
  setPriceRange: (min?: number, max?: number) => void;
  setCondition: (condition?: 'new' | 'used') => void;
  setDynamicFilter: (key: string, value: string | number) => void;
  clearDynamicFilter: (key: string) => void;
  setSortBy: (sort: FilterState['sortBy']) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
}

const defaultFilters: FilterState = {
  query: '',
  categoryExternalID: '',
  locationExternalID: '0-1',
  priceMin: undefined,
  priceMax: undefined,
  condition: undefined,
  dynamicFilters: {},
  sortBy: 'timestamp',
  page: 0,
};

export const useFilterStore = create<FilterStore>(set => ({
  filters: { ...defaultFilters },
  setQuery: query => set(s => ({ filters: { ...s.filters, query, page: 0 } })),
  setCategoryExternalID: id =>
    set(s => ({ filters: { ...s.filters, categoryExternalID: id, page: 0 } })),
  setLocationExternalID: id =>
    set(s => ({ filters: { ...s.filters, locationExternalID: id, page: 0 } })),
  setPriceRange: (min, max) =>
  set(s => ({
    filters: {
      ...s.filters,
      priceMin: min,
      priceMax: max,
      page: 0,
    },
  })),
  setCondition: condition =>
    set(s => ({ filters: { ...s.filters, condition, page: 0 } })),
  setDynamicFilter: (key, value) =>
    set(s => ({
      filters: {
        ...s.filters,
        dynamicFilters: { ...s.filters.dynamicFilters, [key]: value },
        page: 0,
      },
    })),
  clearDynamicFilter: key =>
    set(s => {
      const df = { ...s.filters.dynamicFilters };
      delete df[key];
      return { filters: { ...s.filters, dynamicFilters: df, page: 0 } };
    }),
  setSortBy: sortBy =>
    set(s => ({ filters: { ...s.filters, sortBy, page: 0 } })),
  resetFilters: () => set({ filters: { ...defaultFilters } }),
  setPage: page => set(s => ({ filters: { ...s.filters, page } })),
}));