import { olxApiRequest } from './httpClient';
import { Category, CategoryField } from '../types/category';

export const fetchCategories = async (): Promise<Category[]> => {
  const data = await olxApiRequest('/categories');
  const cats = data?.categories || data || [];
  return cats.map((c: any): Category => ({
    id: String(c.id),
    externalID: String(c.externalID || c.id),
    name: c.name || '',
    nameAr: c.nameAr || c.name_ar || '',
    icon: c.icon,
    parentID: c.parentID ? String(c.parentID) : undefined,
  }));
};

export const fetchCategoryFields = async (): Promise<Record<string, CategoryField[]>> => {
  const data = await olxApiRequest(
    '/categoryFields?includeChildCategories=true&splitByCategoryIDs=true&flatChoices=true&groupChoicesBySection=true&flat=true',
  );
  const result: Record<string, CategoryField[]> = {};
  
  Object.entries(data || {}).forEach(([catID, fieldsRaw]: [string, any]) => {
    const fields: CategoryField[] = (fieldsRaw || []).map((f: any): CategoryField => ({
      key: f.key || f.name,
      label: f.label || f.name,
      labelAr: f.labelAr || f.label_ar,
      type: f.type || 'select',
      choices: (f.choices || []).map((ch: any) => ({
        value: String(ch.value),
        label: ch.label,
        labelAr: ch.labelAr || ch.label_ar,
      })),
      categoryID: catID,
    }));
    result[catID] = fields;
  });
  return result;
};