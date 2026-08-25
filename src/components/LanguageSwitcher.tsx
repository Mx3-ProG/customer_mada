import { Languages } from "lucide-react";
import { LOCALES, LOCALE_CODES, useI18n, type Locale } from "@/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("lang.label")}
        className="flex items-center gap-1.5 rounded-full border border-rule px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-ink transition-opacity hover:opacity-70"
      >
        <Languages className="size-3.5" aria-hidden />
        {locale}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALE_CODES.map((code: Locale) => (
          <DropdownMenuItem
            key={code}
            onSelect={() => setLocale(code)}
            className={code === locale ? "font-medium text-ink" : ""}
          >
            {LOCALES[code].label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
