import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";

const STORAGE_KEY = "theme";

export function ThemeToggle() {
  const [dark, setDark] = useState(true);
  const { t } = useI18n();

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      /* private mode etc. */
    }
  };

  const nextLabel = dark ? t("theme.light") : t("theme.dark");

  return (
    <button
      onClick={toggle}
      aria-label={t("theme.switchTo", { mode: nextLabel })}
      title={t("theme.switchTo", { mode: nextLabel })}
      className="flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-background transition-opacity hover:opacity-80"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        {dark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
          </>
        ) : (
          <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
        )}
      </svg>
      {nextLabel}
    </button>
  );
}
