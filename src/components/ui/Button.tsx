import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "light";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-all duration-200 focus-visible:outline-offset-4 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary:
    "bg-royal text-white shadow-[0_10px_24px_-10px_rgb(23_105_210/0.7)] hover:bg-royal-700 hover:shadow-[0_14px_28px_-10px_rgb(23_105_210/0.8)] hover:-translate-y-0.5",
  secondary: "bg-white text-navy border border-line hover:border-royal/40 hover:bg-sky hover:-translate-y-0.5",
  ghost: "text-navy hover:bg-sky",
  light: "bg-white text-navy hover:bg-mint hover:-translate-y-0.5 shadow-[0_12px_30px_-12px_rgb(0_0_0/0.5)]",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-[0.95rem]",
  lg: "h-13 px-7 text-base",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`.trim();
}

interface CommonProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

/** In-page anchors and internal routes. */
export function ButtonLink({
  variant,
  size,
  className,
  children,
  href,
  ...rest
}: CommonProps & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className">) {
  const cls = buttonClasses(variant, size, className);
  if (href.startsWith("#")) {
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}

export function Button({
  variant,
  size,
  className,
  children,
  ...rest
}: CommonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">) {
  return (
    <button className={buttonClasses(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}
