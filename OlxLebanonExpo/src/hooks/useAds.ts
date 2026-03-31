import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchAds } from '../api/adsService';
import { FilterState } from '../types/filter';

export const useAds = (filters: Partial<FilterState>) => {
  return useInfiniteQuery({
    queryKey: ['ads', filters],
    queryFn: ({ pageParam = 0 }) => fetchAds(filters, pageParam as number),
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.flatMap(p => p.hits).length;
      return loaded < lastPage.total ? allPages.length : undefined;
    },
    initialPageParam: 0,
  });
};