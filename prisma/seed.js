const { PrismaClient } = require("@prisma/client");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const prisma = new PrismaClient();

async function main() {
  const filePath = join(process.cwd(), "src", "data", "local-products.json");
  const products = JSON.parse(readFileSync(filePath, "utf8")).products;

  await prisma.product.deleteMany();

  await prisma.product.createMany({
    data: products.map((product) => ({
      id: product.productId,
      name: product.name,
      insurer: product.insurer,
      category: product.category,
      tags: product.tags,
      supportedPaymentFrequencies: product.supportedPaymentFrequencies,
      minBudgetPercent: product.minBudgetPercent,
      maxBudgetPercent: product.maxBudgetPercent,
      coverageScope: product.coverageScope,
      travelEligible: product.travelEligible,
      deviceProtectionEligible: product.deviceProtectionEligible,
      vehicleEligible: product.vehicleEligible,
      homeEligible: product.homeEligible,
    })),
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
