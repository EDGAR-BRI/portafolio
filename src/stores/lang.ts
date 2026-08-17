import { ref, watch } from 'vue';

export type Lang = 'es' | 'en';

const STORAGE_KEY = 'portfolio.lang';

function detectInitial(): Lang {
  if (typeof window === 'undefined') return 'es';
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === 'es' || saved === 'en') return saved;
  const nav = window.navigator?.language?.slice(0, 2).toLowerCase();
  return nav === 'en' ? 'en' : 'es';
}

const lang = ref<Lang>(detectInitial());

if (typeof window !== 'undefined') {
  watch(lang, (value) => {
    window.localStorage.setItem(STORAGE_KEY, value);
    document.documentElement.lang = value;
  });
}

export function useLang() {
  return lang;
}

export function toggleLang() {
  lang.value = lang.value === 'es' ? 'en' : 'es';
}

export function setLang(next: Lang) {
  lang.value = next;
}