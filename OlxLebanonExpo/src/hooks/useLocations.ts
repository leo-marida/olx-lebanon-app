import { useQuery } from '@tanstack/react-query';
import { fetchLocations } from '../api/locationsService';

export const useLocations = () =>
  useQuery({
    queryKey: ['locations'],
    queryFn: () => fetchLocations('1', 1),
    staleTime: 1000 * 60 * 60,
  });