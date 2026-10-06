import type { ReactNode } from "react";
import { SolutionDetails } from "@/components/marketing/solution-details";
export default async function SolutionLayout({children,params}:{children:ReactNode;params:Promise<{slug:string}>}){const {slug}=await params;return <><div className="hidden">{children}</div><SolutionDetails slug={slug}/></>}
