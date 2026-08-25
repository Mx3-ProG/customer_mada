import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useI18n, type Locale } from "@/i18n";


const STORAGE_KEY = "cookie-consent";
const EVENT = "mada:cookie-preferences";

export type CookieConsent = "accepted" | "rejected";

export function getCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "accepted" || v === "rejected" ? v : null;
  } catch {
    return null;
  }
}

export function openCookiePreferences() {
  window.dispatchEvent(new CustomEvent(EVENT));
}

type Strings = {
  title: string;
  body: string;
  accept: string;
  reject: string;
  more: string;
};

const S: Record<Locale, Strings> = {
  fr: {
    title: "Cookies",
    body: "Nous utilisons des cookies nécessaires au fonctionnement du site et, avec votre accord, des cookies de mesure d'audience. Vous pouvez changer d'avis à tout moment.",
    accept: "Tout accepter",
    reject: "Continuer sans accepter",
    more: "En savoir plus",
  },
  en: {
    title: "Cookies",
    body: "We use cookies required for the site to work and, with your consent, audience-measurement cookies. You can change your mind at any time.",
    accept: "Accept all",
    reject: "Continue without accepting",
    more: "Learn more",
  },
  es: {
    title: "Cookies",
    body: "Usamos cookies necesarias para el funcionamiento del sitio y, con su consentimiento, cookies de medición de audiencia. Puede cambiar de opinión cuando quiera.",
    accept: "Aceptar todo",
    reject: "Continuar sin aceptar",
    more: "Más información",
  },
  de: {
    title: "Cookies",
    body: "Wir verwenden notwendige Cookies und – mit Ihrer Zustimmung – Cookies zur Reichweitenmessung. Sie können Ihre Wahl jederzeit ändern.",
    accept: "Alle akzeptieren",
    reject: "Ohne Zustimmung fortfahren",
    more: "Mehr erfahren",
  },
  ru: {
    title: "Файлы cookie",
    body: "Мы используем необходимые файлы cookie и, с вашего согласия, аналитические. Вы можете изменить выбор в любой момент.",
    accept: "Принять все",
    reject: "Продолжить без согласия",
    more: "Подробнее",
  },
  ar: {
    title: "ملفات تعريف الارتباط",
    body: "نستخدم ملفات ضرورية لعمل الموقع، وبموافقتك ملفات لقياس الجمهور. يمكنك تغيير اختيارك في أي وقت.",
    accept: "قبول الكل",
    reject: "المتابعة دون قبول",
    more: "معرفة المزيد",
  },
  zh: {
    title: "Cookie",
    body: "我们使用网站运行所必需的 Cookie，并在您同意后使用统计分析 Cookie。您可以随时更改选择。",
    accept: "全部接受",
    reject: "不接受并继续",
    more: "了解更多",
  },
};

export function CookieBanner() {
  const { locale } = useI18n();
  const s = S[locale] ?? S.en;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!getCookieConsent()) setOpen(true);
    const handler = () => setOpen(true);
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);

  if (!open) return null;

  const choose = (value: CookieConsent) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* private mode */
    }
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-label={s.title}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-rule bg-background/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] leading-relaxed text-ink-muted">
          {s.body}{" "}
          <Link
            to="/cookies"
            className="underline decoration-ink-faint underline-offset-4 hover:text-ink"
          >
            {s.more}
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => choose("rejected")}
            className="rounded-md border border-rule px-4 py-2 text-sm text-ink transition-colors hover:bg-muted"
          >
            {s.reject}
          </button>
          <button
            type="button"
            onClick={() => choose("accepted")}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {s.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
