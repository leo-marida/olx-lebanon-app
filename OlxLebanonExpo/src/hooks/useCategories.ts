import { useQuery } from '@tanstack/react-query';
import { fetchCategories, fetchCategoryFields } from '../api/categoriesService';

export const useCategories = () =>
  useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 30, // 30 min
  });

export const useCategoryFields = () =>
  useQuery({
    queryKey: ['categoryFields'],
    queryFn: fetchCategoryFields,
    staleTime: 1000 * 60 * 30,
  });