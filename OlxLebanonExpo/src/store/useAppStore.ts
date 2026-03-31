import { create } from 'zustand';

interface AppStore {
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
}

export const useAppStore = create<AppStore>(set => ({
  language: 'en',
  setLanguage: lang => set({ language: lang }),
}));