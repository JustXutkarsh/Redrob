import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-brutal border-[5px] border-ink bg-white p-5 shadow-brutal", className)} {...props} />;
}
