import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import AdminSessionGuard from "@/components/admin/AdminSessionGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import SignOutButton from "@/components/admin/SignOutButton";
import { getCurrentProfile } from "@/lib/auth";

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, profile } = await getCurrentProfile();

  // Middleware already redirects signed-out visitors to /admin/login; this
  // is just a defensive fallback (e.g. session expiring between requests).
  if (!user) {
    redirect("/admin/login");
  }

  if (!profile?.is_admin) {
    return (
      <main className="flex min-h-screen flex-1 flex-col items-center justify-center gap-4 bg-ivory px-6 text-center">
        <h1 className="font-heading text-3xl text-espresso">Access Restricted</h1>
        <p className="max-w-sm font-sans text-sm text-charcoal/70">
          You don&apos;t have access to this area. If you believe this is a
          mistake, contact the site owner.
        </p>
        <SignOutButton />
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-ivory sm:flex-row">
      <AdminSessionGuard adminUserId={user.id} />
      <AdminSidebar />
      <main className="flex-1 px-6 py-10 sm:px-10">{children}</main>
    </div>
  );
}
