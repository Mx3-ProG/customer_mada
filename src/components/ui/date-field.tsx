import * as React from "react";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useI18n } from "@/i18n";

const toIso = (d: Date) => {
  const tz = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return tz.toISOString().slice(0, 10);
};

const fromIso = (iso: string | null | undefined): Date | undefined => {
  if (!iso) return undefined;
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? undefined : d;
};

export function DateField({
  value,
  onChange,
  placeholder,
  clearable = true,
  className,
}: {
  value: string | null;
  onChange: (iso: string | null) => void;
  placeholder?: string;
  clearable?: boolean;
  className?: string;
}) {
  const { locale, t } = useI18n();
  const [open, setOpen] = React.useState(false);
  const selected = fromIso(value);
  const now = new Date();

  const label = selected
    ? selected.toLocaleDateString(locale, { day: "2-digit", month: "long", year: "numeric" })
    : (placeholder ?? t("common.pickDate"));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={cn("relative", className)}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start pr-9 text-left font-normal",
              !selected && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 size-4 shrink-0 opacity-70" />
            <span className="truncate">{label}</span>
          </Button>
        </PopoverTrigger>
        {clearable && selected && (
          <button
            type="button"
            aria-label={t("common.clear")}
            onClick={() => onChange(null)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected ?? now}
          captionLayout="dropdown"
          startMonth={new Date(now.getFullYear() - 60, 0)}
          endMonth={new Date(now.getFullYear() + 10, 11)}
          onSelect={(d) => {
            onChange(d ? toIso(d) : null);
            setOpen(false);
          }}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
        <div className="flex items-center justify-between gap-2 border-t border-border p-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange(toIso(new Date()));
              setOpen(false);
            }}
          >
            {t("common.today")}
          </Button>
          {clearable && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
            >
              {t("common.clear")}
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
