"use client";

import { useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

const inputClass =
  "rounded-md border border-charcoal/20 bg-ivory px-3 py-2 font-sans text-sm text-charcoal focus:border-espresso focus:outline-none";

const readOnlyInputClass =
  "rounded-md border border-charcoal/10 bg-blush/20 px-3 py-2 font-sans text-sm text-charcoal/60";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 font-sans text-sm text-charcoal">
      <span className="text-xs uppercase tracking-[0.15em] text-bronze">{label}</span>
      {children}
    </label>
  );
}

export default function AccountProfileForm({
  profile,
  email,
}: {
  profile: Profile;
  email: string;
}) {
  const supabase = createClient();

  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [addressLine, setAddressLine] = useState(profile.address_line ?? "");
  const [city, setCity] = useState(profile.city ?? "");
  const [state, setState] = useState(profile.state ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim() || null,
          phone: phone.trim() || null,
          address_line: addressLine.trim() || null,
          city: city.trim() || null,
          state: state.trim() || null,
        })
        .eq("id", profile.id);

      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }

      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Could not save your changes. Please check your connection and try again.");
      setSaving(false);
    }
  }

  return (
    <div className="flex max-w-md flex-col gap-4 border border-blush p-6">
      {error && (
        <p className="rounded-md border border-bronze bg-blush/40 px-4 py-3 font-sans text-sm text-espresso">
          {error}
        </p>
      )}

      <Field label="Full Name">
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
      </Field>

      <Field label="Email">
        <input value={email} readOnly disabled className={readOnlyInputClass} />
      </Field>

      <Field label="Phone">
        <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
      </Field>

      <p className="mt-2 font-sans text-xs uppercase tracking-[0.2em] text-bronze">
        Saved Delivery Address
      </p>

      <Field label="Address Line">
        <input
          value={addressLine}
          onChange={(e) => setAddressLine(e.target.value)}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="City">
          <input value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
        </Field>
        <Field label="State">
          <input value={state} onChange={(e) => setState(e.target.value)} className={inputClass} />
        </Field>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="self-start rounded-md bg-espresso px-6 py-3 font-sans text-sm uppercase tracking-[0.2em] text-ivory disabled:opacity-50"
      >
        {saving ? "Saving…" : saved ? "Saved" : "Save"}
      </button>
    </div>
  );
}
