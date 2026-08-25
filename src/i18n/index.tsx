import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { en, type Dictionary, type TranslationKey } from "./locales/en";
import { fr } from "./locales/fr";
import { es } from "./locales/es";
import { de } from "./locales/de";
import { ru } from "./locales/ru";
import { ar } from "./locales/ar";
import { zh } from "./locales/zh";
import { setFormatLocale } from "@/lib/clients";

export const LOCALES = {
  fr: { label: "Français", intl: "fr-FR", dir: "ltr" as const, dict: fr },
  en: { label: "English", intl: "en-GB", dir: "ltr" as const, dict: en as Dictionary },
  es: { label: "Español", intl: "es-ES", dir: "ltr" as const, dict: es },
  de: { label: "Deutsch", intl: "de-DE", dir: "ltr" as const, dict: de },
  ru: { label: "Русский", intl: "ru-RU", dir: "ltr" as const, dict: ru },
  ar: { label: "العربية", intl: "ar", dir: "rtl" as const, dict: ar },
  zh: { label: "中文", intl: "zh-CN", dir: "ltr" as const, dict: zh },
};

export type Locale = keyof typeof LOCALES;
export const LOCALE_CODES = Object.keys(LOCALES) as Locale[];
export const DEFAULT_LOCALE: Locale = "fr";
const STORAGE_KEY = "lang";

function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (m, k: string) =>
    k in vars ? String(vars[k]) : m,
  );
}

type I18nValue = {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

function detect(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && stored in LOCALES) return stored;
  } catch {
    /* private mode */
  }
  const nav = navigator.language?.slice(0, 2).toLowerCase();
  return (LOCALE_CODES as string[]).includes(nav ?? "") ? (nav as Locale) : DEFAULT_LOCALE;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // Detect after hydration to avoid SSR/client markup mismatches.
  useEffect(() => {
    setLocaleState(detect());
  }, []);

  useEffect(() => {
    const conf = LOCALES[locale];
    setFormatLocale(conf.intl);
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      document.documentElement.dir = conf.dir;
    }
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode */
    }
  }, []);

  const t = useCallback<I18nValue["t"]>(
    (key, vars) => {
      const dict = LOCALES[locale].dict;
      return interpolate(dict[key] ?? en[key] ?? key, vars);
    },
    [locale],
  );

  const value = useMemo<I18nValue>(
    () => ({ locale, dir: LOCALES[locale].dir, setLocale, t }),
    [locale, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return {
      locale: DEFAULT_LOCALE,
      dir: "ltr",
      setLocale: () => {},
      t: (key, vars) => interpolate(LOCALES[DEFAULT_LOCALE].dict[key] ?? key, vars),
    };
  }
  return ctx;
}
