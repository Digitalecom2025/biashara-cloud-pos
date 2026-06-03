/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.saleItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.business.deleteMany();

  const business = await prisma.business.create({
    data: {
      name: "Nairobi CBD Store",
      slug: "nairobi-cbd-store",
      phone: "0712 550 184",
      email: "admin@biashara.demo",
      location: "Tom Mboya Street, Nairobi",
      industryMode: "retail",
      packagePlan: "Business",
      status: "active",
    },
  });

  const mainBranch = await prisma.branch.create({
    data: {
      businessId: business.id,
      name: "Main Branch",
      location: "Industrial Area, Nairobi",
      phone: "0701 284 510",
      managerName: "John Kamau",
      status: "Active",
    },
  });

  const cbdBranch = await prisma.branch.create({
    data: {
      businessId: business.id,
      name: "Nairobi CBD Store",
      location: "Tom Mboya Street, Nairobi",
      phone: "0712 550 184",
      managerName: "James Mwangi",
      status: "Active",
    },
  });

  const users = await Promise.all([
    prisma.user.create({ data: { businessId: business.id, branchId: mainBranch.id, name: "James Mwangi", email: "james@biashara.co.ke", phone: "0712 550 184", role: "Business Owner", status: "Active", lastLoginAt: new Date("2026-06-02T13:08:00.000Z") } }),
    prisma.user.create({ data: { businessId: business.id, branchId: cbdBranch.id, name: "Mary Wanjiku", email: "mary@biashara.co.ke", phone: "0722 481 309", role: "Cashier", status: "Active", lastLoginAt: new Date("2026-06-02T12:42:00.000Z") } }),
    prisma.user.create({ data: { businessId: business.id, branchId: mainBranch.id, name: "John Kamau", email: "john@biashara.co.ke", phone: "0701 284 510", role: "Branch Manager", status: "Active", lastLoginAt: new Date("2026-06-02T12:31:00.000Z") } }),
    prisma.user.create({ data: { businessId: business.id, branchId: mainBranch.id, name: "Grace Achieng", email: "grace@biashara.co.ke", phone: "0738 505 920", role: "Accountant", status: "Active", lastLoginAt: new Date("2026-06-02T11:20:00.000Z") } }),
    prisma.user.create({ data: { businessId: business.id, branchId: mainBranch.id, name: "Peter Otieno", email: "peter@biashara.co.ke", phone: "0708 912 376", role: "Stock Clerk", status: "Active", lastLoginAt: new Date("2026-06-01T14:45:00.000Z") } }),
  ]);

  const productSeeds = [
    ["Seed Oil 50ml", "SO-0050", "Cosmetics", "Bottle", 80, 150, 84, 20, "Main Warehouse", "C-01", "S-01", "Seed oil starter bottle"],
    ["Seed Oil 250ml", "SO-0250", "Cosmetics", "Bottle", 260, 450, 12, 10, "Nairobi CBD Store", "C-02", "S-02", "Fast moving seed oil"],
    ["Seed Oil 500ml", "SO-0500", "Cosmetics", "Bottle", 480, 780, 26, 12, "Main Warehouse", "C-03", "S-02", "Mid-size seed oil"],
    ["Seed Oil 1L", "SO-1000", "Cosmetics", "Bottle", 880, 1350, 18, 8, "Nairobi CBD Store", "C-04", "S-03", "Top-selling seed oil"],
    ["Ugali Beef Stew", "RST-UG-BEEF", "Restaurant", "Plate", 180, 350, 40, 15, "Kitchen Store", "K-01", "Hotline", "Restaurant meal"],
    ["Chips Chicken", "RST-CH-CKN", "Restaurant", "Plate", 240, 480, 32, 12, "Kitchen Store", "K-02", "Hotline", "Fast food combo"],
    ["Cement 50kg Bag", "HDW-CEM-50", "Hardware", "Bag", 720, 920, 58, 20, "Main Warehouse", "H-01", "Floor", "Hardware stock"],
    ["Brake Pads Toyota Axio Front", "AUT-BP-AXIO-F", "Auto Spares", "Set", 1650, 2400, 4, 6, "Auto Spares Store", "A-02", "S-05", "Toyota Axio front brake pads"],
    ["Basmati Rice 1kg", "SUP-RICE-1KG", "Supermarket", "Packet", 180, 260, 35, 15, "Nairobi CBD Store", "G-01", "S-01", "Supermarket rice stock"],
    ["Whole Milk 1L", "SUP-MILK-1L", "Supermarket", "Packet", 72, 95, 9, 12, "Nairobi CBD Store", "D-01", "Chiller", "Fresh milk"],
  ];

  const products = await Promise.all(
    productSeeds.map(([name, code, category, unit, purchasePrice, salePrice, stock, reorderLevel, warehouse, rack, shelf, description]) =>
      prisma.product.create({
        data: {
          businessId: business.id,
          branchId: String(warehouse).includes("CBD") ? cbdBranch.id : mainBranch.id,
          name: String(name),
          description: String(description),
          code: String(code),
          category: String(category),
          unit: String(unit),
          purchasePrice,
          salePrice,
          stock,
          reorderLevel,
          warehouse: String(warehouse),
          rack: String(rack),
          shelf: String(shelf),
          status: "Active",
        },
      })
    )
  );

  const customerSeeds = [
    ["Walk-in Customer", "Default counter account", null, "Walk-in", 286400, 0, "Clear"],
    ["Karibu Restaurant", "0721 116 804", "orders@kariburestaurant.co.ke", "Company", 184600, 18600, "Owes"],
    ["Beauty Shop Customer", "0712 840 230", "hello@amanibeauty.co.ke", "Regular", 126900, 6200, "Owes"],
    ["Wholesale Customer", "0705 382 744", "buying@upendowholesale.co.ke", "Wholesale", 542300, 48500, "Overdue"],
    ["Staff Meal Account", "Internal account", null, "Regular", 24800, 2400, "Owes"],
    ["Contractor Client", "0798 662 519", "site@jengacontractors.co.ke", "Company", 368700, 73400, "Overdue"],
  ];

  const customers = await Promise.all(
    customerSeeds.map(([name, phone, email, customerType, totalPurchases, debtBalance, status]) =>
      prisma.customer.create({
        data: { businessId: business.id, name, phone, email, customerType, totalPurchases, debtBalance, status },
      })
    )
  );

  const supplierSeeds = [
    ["Seed Oil Supplier", "0714 502 918", "sales@seedoilsupplier.co.ke", "Cosmetics", 286400, 32400, "Owes"],
    ["Packaging Supplier", "0720 881 346", "orders@packaging.co.ke", "Packaging", 128600, 0, "Clear"],
    ["Nairobi Food Wholesalers", "0719 441 882", "supply@nairobiwholesale.co.ke", "Food stock", 342800, 44800, "Owes"],
    ["Cement Supplier", "0708 790 442", "cement@supplier.co.ke", "Hardware", 784500, 0, "Clear"],
    ["Auto Parts Distributor", "0792 441 683", "parts@autodistributor.co.ke", "Auto Spares", 364900, 74200, "Owes"],
    ["Beauty Products Distributor", "0716 225 441", "beauty@distributor.co.ke", "Cosmetics", 214700, 18200, "Owes"],
  ];

  await Promise.all(
    supplierSeeds.map(([name, phone, email, category, totalPurchases, balance, status]) =>
      prisma.supplier.create({
        data: { businessId: business.id, name, phone, email, category, totalPurchases, balance, status },
      })
    )
  );

  const sale = await prisma.sale.create({
    data: {
      businessId: business.id,
      branchId: cbdBranch.id,
      cashierId: users[1].id,
      customerId: customers[0].id,
      invoiceNumber: "INV-0001",
      subtotal: 1830,
      tax: 0,
      discount: 0,
      total: 1830,
      paid: 1830,
      due: 0,
      paymentMethod: "M-Pesa",
      status: "Paid",
      saleType: "normal",
    },
  });

  await prisma.saleItem.createMany({
    data: [
      { saleId: sale.id, productId: products[3].id, quantity: 1, unitPrice: 1350, total: 1350 },
      { saleId: sale.id, productId: products[5].id, quantity: 1, unitPrice: 480, total: 480 },
    ],
  });

  await prisma.payment.create({
    data: {
      businessId: business.id,
      saleId: sale.id,
      customerId: customers[0].id,
      amount: 1830,
      paymentMethod: "M-Pesa",
      reference: "DEMO-MPESA-001",
      status: "Completed",
    },
  });

  await prisma.expense.createMany({
    data: [
      { businessId: business.id, branchId: mainBranch.id, category: "Packaging", description: "Bottle and label packaging", amount: 28600, paymentMethod: "M-Pesa", recordedBy: "Grace Achieng", status: "Approved" },
      { businessId: business.id, branchId: cbdBranch.id, category: "Rent", description: "CBD store rent allocation", amount: 85000, paymentMethod: "Bank", recordedBy: "Grace Achieng", status: "Approved" },
      { businessId: business.id, branchId: mainBranch.id, category: "Transport", description: "Supplier delivery transport", amount: 12400, paymentMethod: "Cash", recordedBy: "Peter Otieno", status: "Approved" },
    ],
  });

  await prisma.stockMovement.createMany({
    data: [
      { businessId: business.id, branchId: mainBranch.id, productId: products[1].id, type: "purchase", quantity: 60, reason: "Opening stock seed", reference: "PO-DEMO-001", createdBy: "Peter Otieno" },
      { businessId: business.id, branchId: cbdBranch.id, productId: products[3].id, type: "sale", quantity: -1, reason: "Demo sale", reference: "INV-0001", createdBy: "Mary Wanjiku" },
      { businessId: business.id, branchId: mainBranch.id, productId: products[7].id, type: "adjustment", quantity: -2, reason: "Low stock correction", reference: "ADJ-DEMO-001", createdBy: "Peter Otieno" },
    ],
  });

  await prisma.auditLog.create({
    data: {
      businessId: business.id,
      userId: users[0].id,
      action: "seed_database",
      entity: "Business",
      entityId: business.id,
      details: "Seeded Nairobi CBD Store demo tenant.",
    },
  });

  await prisma.subscription.create({
    data: {
      businessId: business.id,
      packagePlan: "Business",
      status: "active",
      startDate: new Date("2026-06-01T00:00:00.000Z"),
      renewalDate: new Date("2026-07-02T00:00:00.000Z"),
      amount: 3000,
    },
  });

  await prisma.setting.createMany({
    data: [
      { businessId: business.id, key: "receiptFooter", value: "Thank you for shopping with us." },
      { businessId: business.id, key: "currency", value: "KES" },
      { businessId: business.id, key: "industryMode", value: "retail" },
    ],
  });

  console.log(`Seeded demo business: ${business.name}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
