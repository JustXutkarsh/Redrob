import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "orange";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-4 border-ink px-5 font-black shadow-brutalSm transition duration-300 hover:-translate-y-1 active:translate-y-1 active:shadow-none",
        variant === "primary" && "bg-cyan text-ink",
        variant === "ghost" && "bg-white text-ink",
        variant === "orange" && "bg-orange text-white",
        className
      )}
      {...props}
    />
  );
}
