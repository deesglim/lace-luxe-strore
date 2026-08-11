"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { friendlyAdminErrorMessage } from "@/lib/adminErrors";
import { formatNaira } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import type { Promotion } from "@/types";

const inputClass =
  "rounded-md border border-charcoal/20 bg-ivory px-3 py-2 font-sans text-sm text-charcoal focus:border-espresso focus:outline-none";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 font-sans text-sm text-charcoal">
      <span className="text-xs uppercase tracking-[0.15em] text-bronze">
        {label}
      </span>
      {children}
    </label>
  );
}

type ProductOption = { id: string; name: string };

type FormState = {
  id?: string;
  code: string;
  type: Promotion["type"];
  value: string;
  scope: Promotion["scope"];
  scopeReference: string;
  active: boolean;
  startsAt: string;
  endsAt: string;
};

function emptyForm(): FormState {
  return {
    code: "",
    type: "percentage",
    value: "",
    scope: "sitewide",
    scopeReference: "",
    active: true,
    startsAt: "",
    endsAt: "",
  };
}

function toFormState(promotion: Promotion): FormState {
  return {
    id: promotion.id,
    code: promotion.code ?? "",
    type: promotion.type,
    value: String(promotion.value),
    scope: promotion.scope,
    scopeReference: promotion.scope_reference ?? "",
    active: promotion.active,
    startsAt: promotion.starts_at ? promotion.starts_at.slice(0, 10) : "",
    endsAt: promotion.ends_at ? promotion.ends_at.slice(0, 10) : "",
  };
}

const PROMOTION_FIELDS =
  "id, type, value, scope, scope_reference, code, active, starts_at, ends_at, created_at";

function scopeLabel(promotion: Promotion, productOptions: ProductOption[]): string {
  if (promotion.scope === "sitewide") return "Sitewide";
  if (promotion.scope === "category") {
    return `Category: ${promotion.scope_reference ?? "—"}`;
  }
  const product = productOptions.find((p) => p.id === promotion.scope_reference);
  return `Product: ${product?.name ?? "Unknown product"}`;
}

function valueLabel(promotion: Promotion): string {
  return promotion.type === "percentage"
    ? `${promotion.value}%`
    : formatNaira(promotion.value);
}

function dateRangeLabel(promotion: Promotion): string {
  const start = promotion.starts_at
    ? new Date(promotion.starts_at).toLocaleDateString()
    : null;
  const end = promotion.ends_at
    ? new Date(promotion.ends_at).toLocaleDateString()
    : null;

  if (!start && !end) return "No limit";
  if (start && !end) return `From ${start}`;
  if (!start && end) return `Until ${end}`;
  return `${start} – ${end}`;
}

export default function PromotionsManager({
  initialPromotions,
  laceTypes,
  productOptions,
}: {
  initialPromotions: Promotion[];
  laceTypes: string[];
  productOptions: ProductOption[];
}) {
  const supabase = createClient();

  const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions);
  const [formState, setFormState] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startAdd() {
    setError(null);
    setFormState(emptyForm());
  }

  function startEdit(promotion: Promotion) {
    setError(null);
    setFormState(toFormState(promotion));
  }

  function cancelForm() {
    setFormState(null);
    setError(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!formState) return;

    const value = Number(formState.value);
    if (!value || value <= 0) {
      setError("Enter a value greater than 0.");
      return;
    }
    if (formState.type === "percentage" && value > 100) {
      setError("A percentage discount can't be more than 100%.");
      return;
    }
    if (formState.scope !== "sitewide" && !formState.scopeReference) {
      setError(
        formState.scope === "category"
          ? "Choose a category."
          : "Choose a product.",
      );
      return;
    }
    if (
      formState.startsAt &&
      formState.endsAt &&
      formState.endsAt < formState.startsAt
    ) {
      setError("The end date can't be before the start date.");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      code: formState.code.trim() || null,
      type: formState.type,
      value,
      scope: formState.scope,
      scope_reference:
        formState.scope === "sitewide" ? null : formState.scopeReference,
      active: formState.active,
      starts_at: formState.startsAt ? `${formState.startsAt}T00:00:00` : null,
      ends_at: formState.endsAt ? `${formState.endsAt}T23:59:59` : null,
    };

    if (formState.id) {
      const { data, error: updateError } = await supabase
        .from("promotions")
        .update(payload)
        .eq("id", formState.id)
        .select(PROMOTION_FIELDS)
        .single();

      if (updateError || !data) {
        setError(friendlyAdminErrorMessage(updateError, "Could not save changes."));
        setSaving(false);
        return;
      }

      setPromotions((current) =>
        current.map((promotion) => (promotion.id === data.id ? data : promotion)),
      );
    } else {
      const { data, error: insertError } = await supabase
        .from("promotions")
        .insert(payload)
        .select(PROMOTION_FIELDS)
        .single();

      if (insertError || !data) {
        const message = insertError?.message ?? "";
        setError(
          message.toLowerCase().includes("duplicate") ||
            message.toLowerCase().includes("unique")
            ? "That code is already in use by another promotion."
            : friendlyAdminErrorMessage(insertError, "Could not create promotion."),
        );
        setSaving(false);
        return;
      }

      setPromotions((current) => [data, ...current]);
    }

    setSaving(false);
    setFormState(null);
  }

  async function handleDelete(promotion: Promotion) {
    const confirmed = window.confirm(
      `Delete "${promotion.code ?? "this automatic sale"}"? This can't be undone.`,
    );
    if (!confirmed) return;

    const { error: deleteError } = await supabase
      .from("promotions")
      .delete()
      .eq("id", promotion.id);

    if (deleteError) {
      setError(friendlyAdminErrorMessage(deleteError, "Could not delete promotion."));
      return;
    }

    setPromotions((current) => current.filter((p) => p.id !== promotion.id));
  }

  return (
    <div className="flex flex-col gap-8">
      {error && (
        <p className="rounded-md border border-bronze bg-blush/40 px-4 py-3 font-sans text-sm text-espresso">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between">
        <p className="font-sans text-sm text-charcoal/70">
          Discount codes and automatic sales. Only one promotion ever applies
          per order — the best-value one wins.
        </p>
        <button
          type="button"
          onClick={startAdd}
          className="shrink-0 rounded-md bg-espresso px-5 py-2.5 font-sans text-sm uppercase tracking-[0.2em] text-ivory"
        >
          + Add Promotion
        </button>
      </div>

      {formState && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-md border border-blush p-6"
        >
          <h3 className="font-heading text-lg text-espresso">
            {formState.id ? "Edit Promotion" : "New Promotion"}
          </h3>

          <Field label="Code (optional — leave blank for an automatic sale)">
            <input
              value={formState.code}
              onChange={(e) =>
                setFormState(
                  (f) => f && { ...f, code: e.target.value.toUpperCase() },
                )
              }
              placeholder="e.g. DEES10"
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Type">
              <select
                value={formState.type}
                onChange={(e) =>
                  setFormState(
                    (f) => f && { ...f, type: e.target.value as Promotion["type"] },
                  )
                }
                className={inputClass}
              >
                <option value="percentage">Percentage Off</option>
                <option value="fixed">Fixed Amount Off (₦)</option>
              </select>
            </Field>
            <Field label={formState.type === "percentage" ? "Value (%)" : "Value (₦)"}>
              <input
                type="number"
                min="0"
                step={formState.type === "percentage" ? "1" : "0.01"}
                value={formState.value}
                onChange={(e) =>
                  setFormState((f) => f && { ...f, value: e.target.value })
                }
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Scope">
            <select
              value={formState.scope}
              onChange={(e) =>
                setFormState(
                  (f) =>
                    f && {
                      ...f,
                      scope: e.target.value as Promotion["scope"],
                      scopeReference: "",
                    },
                )
              }
              className={inputClass}
            >
              <option value="sitewide">Sitewide</option>
              <option value="category">Category</option>
              <option value="product">Product</option>
            </select>
          </Field>

          {formState.scope === "category" && (
            <Field label="Category (Lace Type)">
              <select
                value={formState.scopeReference}
                onChange={(e) =>
                  setFormState(
                    (f) => f && { ...f, scopeReference: e.target.value },
                  )
                }
                className={inputClass}
              >
                <option value="" disabled>
                  Select a category
                </option>
                {laceTypes.map((laceType) => (
                  <option key={laceType} value={laceType}>
                    {laceType}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {formState.scope === "product" && (
            <Field label="Product">
              <select
                value={formState.scopeReference}
                onChange={(e) =>
                  setFormState(
                    (f) => f && { ...f, scopeReference: e.target.value },
                  )
                }
                className={inputClass}
              >
                <option value="" disabled>
                  Select a product
                </option>
                {productOptions.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Start Date (optional)">
              <input
                type="date"
                value={formState.startsAt}
                onChange={(e) =>
                  setFormState((f) => f && { ...f, startsAt: e.target.value })
                }
                className={inputClass}
              />
            </Field>
            <Field label="End Date (optional)">
              <input
                type="date"
                value={formState.endsAt}
                onChange={(e) =>
                  setFormState((f) => f && { ...f, endsAt: e.target.value })
                }
                className={inputClass}
              />
            </Field>
          </div>

          <label className="flex items-center gap-2 font-sans text-sm text-charcoal">
            <input
              type="checkbox"
              checked={formState.active}
              onChange={(e) =>
                setFormState((f) => f && { ...f, active: e.target.checked })
              }
            />
            Active
          </label>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-espresso px-6 py-3 font-sans text-sm uppercase tracking-[0.2em] text-ivory disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={cancelForm}
              className="font-sans text-sm text-bronze underline underline-offset-4"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {promotions.length === 0 ? (
        <p className="font-sans text-sm text-charcoal/70">
          No promotions yet. Add your first discount code or automatic sale.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-blush">
          <table className="w-full border-collapse text-left font-sans text-sm">
            <thead>
              <tr className="border-b border-blush bg-blush/30 text-xs uppercase tracking-[0.1em] text-bronze">
                <th className="px-4 py-3 font-medium">Promotion</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Value</th>
                <th className="px-4 py-3 font-medium">Scope</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Dates</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {promotions.map((promotion) => (
                <tr
                  key={promotion.id}
                  className="border-b border-blush/60 last:border-0"
                >
                  <td className="px-4 py-3 text-charcoal">
                    {promotion.code ?? (
                      <span className="text-charcoal/60">Automatic</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-charcoal/70">
                    {promotion.type === "percentage" ? "Percentage" : "Fixed"}
                  </td>
                  <td className="px-4 py-3 text-charcoal/70">
                    {valueLabel(promotion)}
                  </td>
                  <td className="px-4 py-3 text-charcoal/70">
                    {scopeLabel(promotion, productOptions)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 text-xs uppercase tracking-wide ${
                        promotion.active
                          ? "bg-blush text-espresso"
                          : "bg-charcoal/10 text-charcoal/50"
                      }`}
                    >
                      {promotion.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-charcoal/70">
                    {dateRangeLabel(promotion)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => startEdit(promotion)}
                      className="mr-3 text-bronze underline underline-offset-4"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(promotion)}
                      className="text-bronze underline underline-offset-4"
                    >
                      Delete
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
