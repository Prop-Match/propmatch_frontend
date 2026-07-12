"use client";

import { forwardRef } from "react";
import { Loader2, Check } from "lucide-react";
import { cn } from "@/src/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  success?: boolean;
  block?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-dark active:bg-primary-dark disabled:bg-primary/50",
  secondary:
    "bg-primary-tint text-primary-dark hover:bg-primary/15 active:bg-primary/20 disabled:opacity-50",
  ghost: "bg-transparent text-primary hover:bg-primary-tint active:bg-primary/10 disabled:opacity-50",
  danger: "bg-error text-white hover:bg-error/90 active:bg-error/80 disabled:bg-error/50",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-small",
  md: "h-11 px-5 text-body",
  lg: "h-12 px-6 text-body",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, success, block, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-control font-semibold transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        "disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        block && "w-full",
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {success && !loading && <Check className="size-4" aria-hidden />}
      {children}
    </button>
  );
});
