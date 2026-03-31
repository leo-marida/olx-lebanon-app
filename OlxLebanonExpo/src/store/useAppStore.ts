import { create } from 'zustand';
import { Ad } from '../types/ad';

interface AppStore {
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
  savedAds: Ad[];
  saveAd: (ad: Ad) => void;
  unsaveAd: (id: string) => void;
  isAdSaved: (id: string) => boolean;
}

export const useAppStore = create<AppStore>((set, get) => ({
  language: 'en',
  setLanguage: lang => set({ language: lang }),
  savedAds: [],
  saveAd: (ad: Ad) =>
    set(s => ({
      savedAds: s.savedAds.find(a => a.id === ad.id)
        ? s.savedAds
        : [...s.savedAds, ad],
    })),
  unsaveAd: (id: string) =>
    set(s => ({ savedAds: s.savedAds.filter(a => a.id !== id) })),
  isAdSaved: (id: string) => get().savedAds.some(a => a.id === id),
}));