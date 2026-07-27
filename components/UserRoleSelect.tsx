"use client";
// components/UserRoleSelect.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";

const roles = ["CUSTOMER", "ADMIN", "SUPER_ADMIN"];

export default function UserRoleSelect({ userId, currentRole, isSelf }: { userId: string; currentRole: string; isSelf: boolean }) {
  const router = useRouter();
  const [role, setRole] = useState(currentRole);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(newRole: string) {
    setError("");
    setSaving(true);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? "Eroare la salvare");
      return;
    }
    setRole(newRole);
    router.refresh();
  }

  return (
    <div>
      <select value={role} onChange={(e) => handleChange(e.target.value)} disabled={saving || isSelf} style={{ fontSize: "12px", padding: "4px" }}>
        {roles.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      {error && <p style={{ color: "var(--color-danger)", fontSize: "11px", marginTop: "4px" }}>{error}</p>}
    </div>
  );
}
