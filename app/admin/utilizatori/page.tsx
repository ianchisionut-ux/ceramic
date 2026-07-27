// app/admin/utilizatori/page.tsx
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/admin-guard";
import { redirect } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import UserRoleSelect from "@/components/UserRoleSelect";

export default async function AdminUsersPage() {
  const superAdmin = await requireSuperAdmin();
  if (!superAdmin) redirect("/cont/login");

  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main style={{ padding: "2rem" }}>
      <AdminNav isSuperAdmin />

      <h1 style={{ fontSize: "20px", fontWeight: 500, marginBottom: "4px" }}>Utilizatori</h1>
      <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "20px" }}>
        CUSTOMER cumpara pe site. ADMIN gestioneaza produse si comenzi. SUPER_ADMIN gestioneaza si utilizatorii.
      </p>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>
            <th style={{ padding: "8px" }}>Nume</th>
            <th style={{ padding: "8px" }}>Email</th>
            <th style={{ padding: "8px" }}>Inregistrat</th>
            <th style={{ padding: "8px" }}>Rol</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u: (typeof users)[number]) => (
            <tr key={u.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
              <td style={{ padding: "8px" }}>
                {u.firstName} {u.lastName}
                {u.id === superAdmin.id && (
                  <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}> (tu)</span>
                )}
              </td>
              <td style={{ padding: "8px" }}>{u.email}</td>
              <td style={{ padding: "8px" }}>{u.createdAt.toLocaleDateString("ro-RO")}</td>
              <td style={{ padding: "8px" }}>
                <UserRoleSelect userId={u.id} currentRole={u.role} isSelf={u.id === superAdmin.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
