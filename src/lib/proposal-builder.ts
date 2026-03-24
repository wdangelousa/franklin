import "server-only";

import { brand } from "@/lib/brand";
import { prisma } from "@/lib/prisma";
import type {
  ProposalBuilderBillingType,
  ProposalBuilderCatalogSection
} from "@/lib/proposal-draft";
import { localizeServiceCategory } from "@/lib/service-catalog";

export async function getInternalProposalCatalog(): Promise<ProposalBuilderCatalogSection[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  const organization = await prisma.organization.findUnique({
    where: {
      slug: brand.organizationSlug
    },
    select: {
      id: true
    }
  });

  if (!organization) {
    return [];
  }

  const categories = await prisma.serviceCategory.findMany({
    where: {
      organizationId: organization.id
    },
    orderBy: {
      sortOrder: "asc"
    },
    include: {
      services: {
        orderBy: [
          {
            sortOrder: "asc"
          },
          {
            publicName: "asc"
          }
        ]
      }
    }
  });

  return categories.map((category) => {
    const localizedCategory = localizeServiceCategory({
      code: category.code,
      name: category.name,
      description: category.description
    });

    return {
      code: category.code,
      name: localizedCategory.name,
      description: localizedCategory.description,
      sortOrder: category.sortOrder,
      services: category.services.map((service) => ({
        categoryCode: category.code,
        categoryName: localizedCategory.name,
        categoryDescription: localizedCategory.description,
        categorySortOrder: category.sortOrder,
        internalCode: service.internalCode,
        slug: service.slug,
        serviceName: service.serviceName,
        publicName: service.publicName,
        longDescription: service.longDescription,
        specificClause: service.specificClause,
        submissionNotes: service.submissionNotes,
        billingType: service.billingType as ProposalBuilderBillingType,
        unitLabel: service.unitLabel,
        unitPriceCents: service.priceCents ?? 0,
        allowsVariableQuantity: service.allowsVariableQuantity,
        isActive: service.isActive,
        sortOrder: service.sortOrder
      }))
    };
  });
}
