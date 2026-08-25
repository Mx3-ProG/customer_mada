import { cn } from "@/lib/utils";

type Props = {
  label?: string;
  size?: number;
  className?: string;
};

/** Animated brand mark: subtle vibration + luminescent halo, used as a busy indicator. */
export function BrandLoader({ label, size = 48, className }: Props) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-3", className)}
      role="status"
      aria-live="polite"
    >
      <span className="brand-loader relative inline-flex" style={{ width: size, height: size }}>
        <span className="brand-loader-glow" aria-hidden />
        <img
          src="/logo-mada.png"
          alt=""
          aria-hidden
          width={size}
          height={size}
          className="brand-loader-mark relative size-full object-contain"
        />
      </span>
      {label && (
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
          {label}
        </span>
      )}
    </div>
  );
}

/** Inline (small) variant for buttons and rows. */
export function BrandSpinner({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn("brand-loader relative inline-flex align-middle", className)}
      style={{ width: size, height: size }}
      role="status"
      aria-live="polite"
    >
      <span className="brand-loader-glow" aria-hidden />
      <img
        src="/logo-mada.png"
        alt=""
        aria-hidden
        className="brand-loader-mark relative size-full object-contain"
      />
    </span>
  );
}
