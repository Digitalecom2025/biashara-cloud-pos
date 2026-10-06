import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/marketing/site";
export default function robots():MetadataRoute.Robots{return{rules:[{userAgent:"*",allow:"/",disallow:["/dashboard","/sales","/products","/customers","/debtors","/suppliers","/purchases","/warehouse","/branches","/hrm","/finance","/reports","/fleet","/settings","/subscriptions","/super-admin","/api/"]}],sitemap:`${SITE_URL}/sitemap.xml`};}
