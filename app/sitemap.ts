import type { MetadataRoute } from "next";
import { articles, industries, SITE_URL } from "@/lib/marketing/site";
export default function sitemap():MetadataRoute.Sitemap{return ["","/features","/pricing","/solutions","/blog","/guides","/resources/university","/products/crm","/products/leads-store","/about","/contact","/privacy","/terms",...industries.map(i=>`/solutions/${i.slug}`),...articles.map(a=>`/blog/${a.slug}`)].map(path=>({url:`${SITE_URL}${path}`,lastModified:new Date(),changeFrequency:"weekly",priority:path===""?1:0.7}));}
