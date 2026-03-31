export interface Category {
  id: string;
  externalID: string;
  name: string;
  nameAr?: string;
  icon?: string;
  parentID?: string;
  children?: Category[];
}

export interface CategoryField {
  key: string;
  label: string;
  labelAr?: string;
  type: 'select' | 'multiselect' | 'range' | 'text';
  choices?: CategoryFieldChoice[];
  categoryID: string;
}

export interface CategoryFieldChoice {
  value: string;
  label: string;
  labelAr?: string;
}