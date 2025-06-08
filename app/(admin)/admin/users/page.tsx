// app/(admin)/admin/users/page.tsx
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  governorate: string;
  role: string;
  createdAt: string;
};

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    // استخدم optional chaining لتجنب `session.user` ممكن تكون undefined
    if (session?.user?.role !== "ADMIN") {
      router.push("/admin/login");
      return;
    }

    fetch("/api/admin/users")
      .then((res) => {
        if (!res.ok) throw new Error("فشل في جلب المستخدمين");
        return res.json();
      })
      .then((data) => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch(() => {
        setError("حدث خطأ أثناء جلب المستخدمين");
        setLoading(false);
      });
  }, [session, status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">إدارة المستخدمين</h1>
      {users.length === 0 ? (
        <p className="text-gray-600">لا يوجد مستخدمين حالياً.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>البريد الإلكتروني</th>
                <th>الهاتف</th>
                <th>المحافظة</th>
                <th>الدور</th>
                <th>التاريخ</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td>{u.governorate}</td>
                  <td>{u.role}</td>
                  <td>
                    {new Date(u.createdAt).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                  <td className="space-x-2">
                    <Link
                      href={`/admin/users/${u.id}/edit`}
                      className="btn btn-sm btn-outline"
                    >
                      تعديل
                    </Link>
                    <button
                      onClick={() => {
                        if (!confirm("حذف المستخدم؟")) return;
                        fetch(`/api/admin/users/${u.id}`, {
                          method: "DELETE",
                        }).then((r) => {
                          if (r.ok) {
                            setUsers((prev) =>
                              prev.filter((x) => x.id !== u.id)
                            );
                          } else {
                            alert("فشل في حذف المستخدم");
                          }
                        });
                      }}
                      className="btn btn-sm btn-error"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
