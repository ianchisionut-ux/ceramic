// lib/admin-guard.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// ADMIN sau SUPER_ADMIN - acces la gestiunea de zi cu zi (produse, comenzi)
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) return null;

  return user;
}

// doar SUPER_ADMIN - acces la gestiunea utilizatorilor si rolurilor
export async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "SUPER_ADMIN") return null;

  return user;
}
