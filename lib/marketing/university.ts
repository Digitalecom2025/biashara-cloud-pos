export const learningTracks = [
  ["AI for Business", "Introduction to AI, ChatGPT for business, Gemini and other tools, research, marketing and customer service."],
  ["AI Agents & Automation", "AI agents, workflow automation, sales assistants, service agents, n8n concepts and custom-software decisions."],
  ["Business Operations", "Inventory, customer records, supplier management, debtor control, branches and business KPIs."],
  ["Sales & CRM", "Customer management, follow-up, pipeline concepts, retention, debt collection and CRM best practices."],
  ["Retail & POS", "Choosing POS software, cashier processes, reconciliation, inventory control and retail reports."],
  ["E-commerce", "Online stores, catalogues, merchandising, social and WhatsApp commerce, and connected sales."],
  ["Digital Marketing", "SEO, content, Google Business Profile, social media, AI-assisted marketing and lead generation."],
  ["Finance & Business Tools", "Expense tracking, cash-flow concepts, dashboards, reports and practical digital records."],
  ["Software & Technology for SMEs", "Buy vs build, cloud software, security basics, backups, APIs, integrations and planning."],
] as const;

export const featuredLessons = [
  { title: "ChatGPT for business", category: "AI for Business", status: "Coming Soon" },
  { title: "Customer records that support better follow-up", category: "Sales & CRM", status: "Coming Soon" },
  { title: "How to choose business software", category: "Business Operations", status: "Available" },
] as const;

const fallback = "https://wa.me/254141743679?text=" + encodeURIComponent("Hi LeadsStacks, I would like to join the Leads Stacks University WhatsApp Community.");
export const whatsappCommunityUrl = process.env.NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL || fallback;
