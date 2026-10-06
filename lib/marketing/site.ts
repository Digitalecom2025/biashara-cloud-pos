export const SITE_URL = "https://leadsstacks.com";
export const CONTACT = {
  phone: "+254 141 743 679",
  tel: "+254141743679",
  whatsapp: "https://wa.me/254141743679",
  salesEmail: "sales@leadsstacks.com",
  generalEmail: "tevin@leadsstacks.com",
  address: ["1 Ridgeway Lane", "Garden Estate Rd", "Nairobi", "Kenya"],
};

export type MarketingNavigationLink = {
  href: string;
  label: string;
};

// This is deliberately static shared data. Marketing navigation must render the
// same links during SSR and the first client render.
export const marketingNavigation = {
  products: [
    { href: "/products/crm", label: "Leads Stacks CRM" },
    { href: "/products/leads-store", label: "Leads Store" },
  ],
  resources: [
    { href: "/blog", label: "Blog" },
    { href: "/guides", label: "Business Guides" },
    { href: "/resources/university", label: "Leads Stacks University" },
    { href: "/features#faq", label: "FAQs" },
  ],
  utility: [
    { href: "/solutions", label: "Solutions" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/login", label: "Sign In" },
  ],
} as const satisfies Record<string, readonly MarketingNavigationLink[]>;

export const industries = [
  { slug: "retail-pos-kenya", name: "Retail", keyword: "Retail POS System Kenya", image: "retail-kenya.png", alt: "Illustrative Kenyan neighbourhood retail shop interior", problem: "Keep checkout moving while staying on top of stock and customer balances.", workflow: ["Add products", "Record sales", "Monitor stock", "Review daily reports"] },
  { slug: "restaurant-pos-kenya", name: "Restaurant", keyword: "Restaurant POS System Kenya", image: "restaurant-east-africa.png", alt: "Illustrative East African restaurant counter", problem: "Bring daily sales, product stock and customer records into one practical workspace.", workflow: ["Set up menu items", "Record sales", "Track purchases", "Review daily takings"] },
  { slug: "hardware-pos-kenya", name: "Hardware", keyword: "Hardware POS System Kenya", image: "hardware-east-africa.png", alt: "Illustrative East African hardware shop with tools and supplies", problem: "Control a wide catalogue, supplier purchases, customer credit and stock movement.", workflow: ["Add building supplies", "Receive purchases", "Record sales", "Follow up customer debt"] },
  { slug: "pharmacy-pos-kenya", name: "Pharmacy", keyword: "Pharmacy POS System Kenya", image: "pharmacy-east-africa.png", alt: "Illustrative East African pharmacy interior", problem: "Make sales and stock records easier to review in a busy chemist.", workflow: ["Load products", "Record sales", "Monitor stock", "Review reports"] },
  { slug: "agrovet-pos-kenya", name: "Agrovet", keyword: "Agrovet POS Kenya", image: "agrovet-east-africa.png", alt: "Illustrative East African agrovet shop with farm supplies", problem: "Track products, purchases, suppliers and customer balances from one connected platform.", workflow: ["Add products", "Receive supplier stock", "Record sales", "Check customer balances"] },
  { slug: "auto-spares-pos-kenya", name: "Auto Spares", keyword: "Auto Spares POS Kenya", image: "auto-spares-east-africa.png", alt: "Illustrative East African auto-spares shop", problem: "Bring parts stock, purchases, sales and customer payments together.", workflow: ["Add parts", "Record purchases", "Sell parts", "Review stock reports"] },
  { slug: "wholesale-pos-kenya", name: "Wholesale", keyword: "Wholesale Management Software Kenya", image: "wholesale-east-africa.png", alt: "Illustrative East African wholesale stockroom", problem: "Manage larger stock movements, suppliers, purchases and branch visibility.", workflow: ["Receive stock", "Record sales", "Track transfers", "Review branch reports"] },
  { slug: "beauty-pos-kenya", name: "Beauty", keyword: "Cosmetics POS Kenya", image: "beauty-east-africa.png", alt: "Illustrative East African beauty and cosmetics shop", problem: "Keep product lines, sales, customers and stock in one organized place.", workflow: ["Add product lines", "Record sales", "Monitor stock", "Review performance"] },
  { slug: "butchery-pos-kenya", name: "Butchery", keyword: "Butchery POS Kenya", image: "butchery-east-africa.png", alt: "Illustrative East African neighbourhood butchery", problem: "Make daily sales, product records and business reporting easier to control.", workflow: ["Set up products", "Record sales", "Track expenses", "Review daily performance"] },
  { slug: "electronics-pos-kenya", name: "Electronics", keyword: "Electronics Shop POS Kenya", image: "electronics-east-africa.png", alt: "Illustrative East African electronics accessories shop", problem: "Manage fast-moving accessories, stock, suppliers and customer records.", workflow: ["Add products", "Receive purchases", "Record sales", "Review inventory"] },
] as const;

export const articles = [
  { slug: "choose-pos-system-kenya", title: "How to Choose a POS System for Your Business in Kenya", category: "POS guides", excerpt: "A practical checklist for choosing software that matches daily operations and future growth.", date: "2026-09-18", body: ["A useful POS system should fit the way your team sells today while giving you clearer records tomorrow. Start with everyday tasks: recording sales, adding products, checking stock and following up customer balances.", "Ask how the system handles the workflows that matter to your business. A hardware shop may need close supplier and purchase records, while a growing retailer may need branch visibility and reports.", "Choose a provider that explains what is available now, supports setup and gives you room to add modules as your business grows."] },
  { slug: "manage-inventory-small-business", title: "How to Manage Inventory in a Small Business", category: "Inventory", excerpt: "Simple habits that make stock records more useful every day.", date: "2026-09-12", body: ["Inventory control begins with clean product records. Give each item a clear name, price and quantity, then make sure purchases and sales are recorded consistently.", "Review stock reports regularly to spot products that are moving quickly, products that have stopped moving and differences worth investigating.", "Connected purchase, sales and stock records help an owner make decisions from the same picture of the business."] },
  { slug: "reduce-stock-losses-retail-shop", title: "How to Reduce Stock Losses in a Retail Shop", category: "Retail operations", excerpt: "Use better stock records and regular review to notice gaps earlier.", date: "2026-09-05", body: ["Stock loss is easier to address when you can compare recorded purchases, sales and physical stock. Build a simple routine for receiving stock, recording adjustments and reviewing differences.", "Give team members clear responsibilities and review exceptions with a calm, repeatable process. Good records turn a difficult conversation into something you can investigate.", "Use reports to focus your time on the products and categories that need attention."] },
  { slug: "track-customer-debts", title: "How to Track Customer Debts Without Using a Notebook", category: "Customer management", excerpt: "Keep balances, payments and follow-ups in one clear record.", date: "2026-08-28", body: ["Customer credit can support sales, but only when balances stay visible. Create a customer record before recording a credit sale, then record each payment against the balance.", "A current debtor list helps owners prioritize follow-up and avoid relying on notes scattered across the business.", "Review balances frequently and agree practical credit terms with customers before debt grows."] },
  { slug: "pos-system-vs-excel", title: "POS System vs Excel: Which Is Better for a Growing Business?", category: "POS guides", excerpt: "Compare the everyday record-keeping needs of a growing SME.", date: "2026-08-21", body: ["Spreadsheets are familiar, but manual updates can become difficult once sales, stock, customers and staff all need current information.", "A connected POS system records activity as it happens and gives owners reports without needing to combine separate files.", "The right choice depends on your workflow, but growing businesses often benefit from records that stay connected."] },
  { slug: "hardware-store-inventory-control", title: "How Hardware Stores Can Improve Inventory Control", category: "Hardware", excerpt: "Practical ways to bring a broad product catalogue under control.", date: "2026-08-14", body: ["Hardware shops carry many product types and often buy from several suppliers. Keep purchase records connected to products so stock movement is easier to understand.", "Use reports to identify products that need replenishment, review customer credit and make supplier conversations more informed.", "A system should support the daily reality of selling varied building supplies, not force every shop into the same workflow."] },
  { slug: "restaurant-owner-daily-tracking", title: "What Every Restaurant Owner Should Track Daily", category: "Restaurant", excerpt: "A focused daily routine for sales, expenses and stock records.", date: "2026-08-07", body: ["Daily sales are only one part of the picture. Restaurant owners also need a routine for expenses, purchases and stock used in the business.", "Review reports at the same time each day so changes are easier to notice and discuss with the team.", "Start with consistent records and build your process as the business grows."] },
  { slug: "multi-branch-operational-control", title: "How Multi-Branch Businesses Can Improve Operational Control", category: "Business growth", excerpt: "Create one connected view while branches continue their day-to-day work.", date: "2026-07-31", body: ["As branches grow, information can become fragmented. Set up clear branch records, product processes and reporting routines that give owners a shared view.", "Use branch reporting and stock movement records to identify questions early, then work with each branch on the relevant detail.", "A connected platform helps management spend less time collecting information and more time acting on it."] },
] as const;
