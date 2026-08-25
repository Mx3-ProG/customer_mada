import { Link } from "@tanstack/react-router";
import { useI18n, type Locale } from "@/i18n";
import { openCookiePreferences } from "@/components/legal/CookieBanner";

type Strings = {
  legal: string;
  privacy: string;
  terms: string;
  sales: string;
  cookies: string;
  manage: string;
  love: string;
};

const S: Record<Locale, Strings> = {
  fr: {
    legal: "Mentions légales",
    privacy: "Confidentialité",
    terms: "CGU",
    sales: "CGV",
    cookies: "Cookies",
    manage: "Gérer les cookies",
    love: "Développé avec amour par Wayne-Web",
  },
  en: {
    legal: "Legal notice",
    privacy: "Privacy",
    terms: "Terms of use",
    sales: "Terms of sale",
    cookies: "Cookies",
    manage: "Manage cookies",
    love: "Developed with love by Wayne-Web",
  },
  es: {
    legal: "Aviso legal",
    privacy: "Privacidad",
    terms: "Condiciones de uso",
    sales: "Condiciones de venta",
    cookies: "Cookies",
    manage: "Gestionar cookies",
    love: "Desarrollado con amor por Wayne-Web",
  },
  de: {
    legal: "Impressum",
    privacy: "Datenschutz",
    terms: "Nutzungsbedingungen",
    sales: "Verkaufsbedingungen",
    cookies: "Cookies",
    manage: "Cookies verwalten",
    love: "Mit Liebe entwickelt von Wayne-Web",
  },
  ru: {
    legal: "Правовая информация",
    privacy: "Конфиденциальность",
    terms: "Условия использования",
    sales: "Условия продажи",
    cookies: "Файлы cookie",
    manage: "Настроить cookie",
    love: "Разработано с любовью Wayne-Web",
  },
  ar: {
    legal: "إشعار قانوني",
    privacy: "الخصوصية",
    terms: "شروط الاستخدام",
    sales: "شروط البيع",
    cookies: "ملفات تعريف الارتباط",
    manage: "إدارة ملفات الارتباط",
    love: "طُوِّر بحب بواسطة Wayne-Web",
  },
  zh: {
    legal: "法律声明",
    privacy: "隐私政策",
    terms: "使用条款",
    sales: "销售条款",
    cookies: "Cookie",
    manage: "管理 Cookie",
    love: "由 Wayne-Web 用心开发",
  },
};

export function SiteFooter() {
  const { locale } = useI18n();
  const s = S[locale] ?? S.en;

  const links = [
    ["/mentions-legales", s.legal],
    ["/confidentialite", s.privacy],
    ["/cgu", s.terms],
    ["/cgv", s.sales],
    ["/cookies", s.cookies],
  ] as const;

  return (
    <footer className="border-t border-rule">
      <div className="mx-auto max-w-4xl px-8 py-8">
        <nav aria-label={s.legal} className="flex flex-wrap justify-center gap-x-5 gap-y-2">
          {links.map(([to, label]) => (
            <Link
              key={to}
              to={to}
              className="text-[13px] text-ink-muted underline decoration-ink-faint underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
            >
              {label}
            </Link>
          ))}
          <button
            type="button"
            onClick={openCookiePreferences}
            className="text-[13px] text-ink-muted underline decoration-ink-faint underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
          >
            {s.manage}
          </button>
        </nav>
        <p className="mt-6 text-center text-[13px] text-ink-muted">
          <a
            href="https://www.wayne-web.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-ink-faint underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
          >
            {s.love}
          </a>
        </p>
        <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
          © {new Date().getFullYear()} Mada Customer Software
        </p>
      </div>
    </footer>
  );
}
