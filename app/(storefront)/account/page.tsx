import { redirect } from "next/navigation";
import AccountProfileForm from "@/components/AccountProfileForm";
import SignOutButton from "@/components/SignOutButton";
import { getCurrentProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const { user, profile } = await getCurrentProfile();

  if (!user || !profile) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-ivory px-6 py-20">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="font-sans text-xs uppercase tracking-[0.3em] text-bronze">
              My Account
            </span>
            <h1 className="mt-2 font-heading text-3xl text-espresso">
              {profile.full_name ? `Welcome, ${profile.full_name}` : "Welcome"}
            </h1>
          </div>
          <SignOutButton />
        </div>

        <section className="flex flex-col gap-4">
          <h2 className="font-heading text-xl text-espresso">Profile</h2>
          <AccountProfileForm profile={profile} email={user.email ?? ""} />
        </section>
      </div>
    </main>
  );
}
