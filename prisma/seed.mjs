import { PrismaClient } from "@prisma/client";

import {
  seedOrganization,
  serviceCatalogSeed
} from "./seed-data/onebridge-service-catalog.mjs";

const prisma = new PrismaClient();

async function main() {
  const organization = await prisma.organization.upsert({
    where: {
      slug: seedOrganization.slug
    },
    update: {
      name: seedOrganization.name
    },
    create: seedOrganization
  });

  for (const category of serviceCatalogSeed) {
    const savedCategory = await prisma.serviceCategory.upsert({
      where: {
        organizationId_code: {
          organizationId: organization.id,
          code: category.code
        }
      },
      update: {
        name: category.name,
        description: category.description,
        sortOrder: category.sortOrder
      },
      create: {
        organizationId: organization.id,
        code: category.code,
        name: category.name,
        description: category.description,
        sortOrder: category.sortOrder
      }
    });

    for (const service of category.services) {
      await prisma.service.upsert({
        where: {
          organizationId_internalCode: {
            organizationId: organization.id,
            internalCode: service.internalCode
          }
        },
        update: {
          categoryId: savedCategory.id,
          internalCode: service.internalCode,
          slug: service.slug,
          serviceName: service.serviceName,
          publicName: service.publicName,
          longDescription: service.longDescription,
          billingType: service.billingType,
          unitLabel: service.unitLabel,
          priceCents: service.priceCents,
          allowsVariableQuantity: service.allowsVariableQuantity,
          specificClause: service.specificClause,
          submissionNotes: service.submissionNotes,
          deliverables: service.deliverables,
          isActive: service.isActive,
          status: service.status,
          sortOrder: service.sortOrder
        },
        create: {
          organizationId: organization.id,
          categoryId: savedCategory.id,
          internalCode: service.internalCode,
          slug: service.slug,
          serviceName: service.serviceName,
          publicName: service.publicName,
          longDescription: service.longDescription,
          billingType: service.billingType,
          unitLabel: service.unitLabel,
          priceCents: service.priceCents,
          allowsVariableQuantity: service.allowsVariableQuantity,
          specificClause: service.specificClause,
          submissionNotes: service.submissionNotes,
          deliverables: service.deliverables,
          isActive: service.isActive,
          status: service.status,
          sortOrder: service.sortOrder
        }
      });
    }
  }
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
