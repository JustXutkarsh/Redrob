import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("inline-flex rounded-full border-[3px] border-ink bg-yellow px-3 py-1 text-sm font-black", className)} {...props} />;
}
