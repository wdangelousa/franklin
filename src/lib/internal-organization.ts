import "server-only";

import type { UserRole } from "@prisma/client";

import type { SessionData } from "@/lib/auth/types";
import { brand } from "@/lib/brand";
import { prisma } from "@/lib/prisma";

export async function ensureInternalActor(session: SessionData) {
  const organization = await prisma.organization.upsert({
    where: {
      slug: brand.organizationSlug
    },
    update: {
      name: brand.organizationName
    },
    create: {
      slug: brand.organizationSlug,
      name: brand.organizationName
    }
  });

  const user = await prisma.user.upsert({
    where: {
      email: session.user.email
    },
    update: {
      organizationId: organization.id,
      name: session.user.name,
      title: session.user.title,
      role: session.user.role as UserRole,
      isActive: true
    },
    create: {
      organizationId: organization.id,
      email: session.user.email,
      name: session.user.name,
      title: session.user.title,
      role: session.user.role as UserRole
    }
  });

  return {
    organization,
    user
  };
}
