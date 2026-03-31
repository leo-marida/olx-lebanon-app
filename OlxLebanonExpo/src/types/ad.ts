export interface AdImage {
  id: string;
  url: string;
}

export interface AdLocation {
  externalID: string;
  name: string;
  hierarchy?: Array<{ externalID: string; name: string }>;
}

export interface AdCategory {
  externalID: string;
  name: string;
}

export interface Ad {
  id: string;
  title: string;
  price?: number;
  currency?: string;
  images: AdImage[];
  location: AdLocation;
  category: AdCategory;
  timestamp: number;
  isElite?: boolean;
  isHighlighted?: boolean;
  extraFields?: Record<string, string | number>;
}

export interface AdsResponse {
  hits: Ad[];
  total: number;
}