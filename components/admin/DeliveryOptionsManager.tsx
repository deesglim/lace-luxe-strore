"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { friendlyAdminErrorMessage } from "@/lib/adminErrors";
import {
  DELIVERY_CATEGORY_LABELS,
  groupDeliveryOptionsByCategory,
} from "@/lib/delivery";
import { formatNaira } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import type { DeliveryOption, StoreSettings } from "@/types";

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

type FormState = {
  id?: string;
  category: DeliveryOption["category"];
  name: string;
  description: string;
  price: string;
  delivery_time: string;
  active: boolean;
  display_order: string;
};

function emptyForm(): FormState {
  return {
    category: "pickup",
    name: "",
    description: "",
    price: "0",
    delivery_time: "",
    active: true,
    display_order: "0",
  };
}

function toFormState(option: DeliveryOption): FormState {
  return {
    id: option.id,
    category: option.category,
    name: option.name,
    description: option.description ?? "",
    price: String(option.price),
    delivery_time: option.delivery_time ?? "",
    active: option.active,
    display_order: String(option.display_order),
  };
}

const DELIVERY_OPTION_FIELDS =
  "id, category, name, description, price, delivery_time, active, display_order, created_at";

export default function DeliveryOptionsManager({
  initialOptions,
  initialSettings,
}: {
  initialOptions: DeliveryOption[];
  initialSettings: StoreSettings | null;
}) {
  const supabase = createClient();

  const [options, setOptions] = useState<DeliveryOption[]>(initialOptions);
  const [formState, setFormState] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [noticeText, setNoticeText] = useState(
    initialSettings?.delivery_notice ?? "",
  );
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(
    String(initialSettings?.free_shipping_threshold ?? 200000),
  );
  const [settingsId, setSettingsId] = useState<string | null>(
    initialSettings?.id ?? null,
  );
  const [savingNotice, setSavingNotice] = useState(false);
  const [noticeSaved, setNoticeSaved] = useState(false);

  const grouped = groupDeliveryOptionsByCategory(options);

  function startAdd() {
    setError(null);
    setFormState(emptyForm());
  }

  function startEdit(option: DeliveryOption) {
    setError(null);
    setFormState(toFormState(option));
  }

  function cancelForm() {
    setFormState(null);
    setError(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!formState) return;

    const name = formState.name.trim();
    if (!name) {
      setError("Name is required.");
      return;
    }

    const price = Number(formState.price);
    if (formState.price.trim() !== "" && (!Number.isFinite(price) || price < 0)) {
      setError("Enter a valid, non-negative price.");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      category: formState.category,
      name,
      description: formState.description.trim() || null,
      price: Number.isFinite(price) ? price : 0,
      delivery_time: formState.delivery_time.trim() || null,
      active: formState.active,
      display_order: Number(formState.display_order) || 0,
    };

    if (formState.id) {
      const { data, error: updateError } = await supabase
        .from("delivery_options")
        .update(payload)
        .eq("id", formState.id)
        .select(DELIVERY_OPTION_FIELDS)
        .single();

      if (updateError || !data) {
        setError(friendlyAdminErrorMessage(updateError, "Could not save changes."));
        setSaving(false);
        return;
      }

      setOptions((current) =>
        current.map((option) => (option.id === data.id ? data : option)),
      );
    } else {
      const { data, error: insertError } = await supabase
        .from("delivery_options")
        .insert(payload)
        .select(DELIVERY_OPTION_FIELDS)
        .single();

      if (insertError || !data) {
        setError(friendlyAdminErrorMessage(insertError, "Could not create delivery option."));
        setSaving(false);
        return;
      }

      setOptions((current) => [...current, data]);
    }

    setSaving(false);
    setFormState(null);
  }

  async function handleDelete(option: DeliveryOption) {
    const confirmed = window.confirm(
      `Delete "${option.name}"? This can't be undone.`,
    );
    if (!confirmed) return;

    const { error: deleteError } = await supabase
      .from("delivery_options")
      .delete()
      .eq("id", option.id);

    if (deleteError) {
      setError(friendlyAdminErrorMessage(deleteError, "Could not delete delivery option."));
      return;
    }

    setOptions((current) => current.filter((o) => o.id !== option.id));
  }

  async function handleSaveNotice() {
    setSavingNotice(true);
    setNoticeSaved(false);
    setError(null);

    const payload = {
      delivery_notice: noticeText,
      free_shipping_threshold: Number(freeShippingThreshold) || 0,
    };

    if (settingsId) {
      const { error: updateError } = await supabase
        .from("store_settings")
        .update(payload)
        .eq("id", settingsId);

      if (updateError) {
        setError(friendlyAdminErrorMessage(updateError, "Could not save changes."));
        setSavingNotice(false);
        return;
      }
    } else {
      const { data, error: insertError } = await supabase
        .from("store_settings")
        .insert(payload)
        .select("id")
        .single();

      if (insertError || !data) {
        setError(friendlyAdminErrorMessage(insertError, "Could not save settings."));
        setSavingNotice(false);
        return;
      }
      setSettingsId(data.id);
    }

    setSavingNotice(false);
    setNoticeSaved(true);
    setTimeout(() => setNoticeSaved(false), 2000);
  }

  return (
    <div className="flex flex-col gap-10">
      {error && (
        <p className="rounded-md border border-bronze bg-blush/40 px-4 py-3 font-sans text-sm text-espresso">
          {error}
        </p>
      )}

      <div className="rounded-md border border-blush p-6">
        <h2 className="mb-3 font-heading text-xl text-espresso">
          Delivery Notice
        </h2>
        <p className="mb-3 font-sans text-xs text-charcoal/60">
          Shown to customers on the checkout page, below the delivery method
          selector.
        </p>
        <textarea
          value={noticeText}
          onChange={(e) => setNoticeText(e.target.value)}
          rows={5}
          className={`${inputClass} w-full`}
        />

        <div className="mt-6">
          <Field label="Free Shipping Threshold (₦)">
            <input
              type="number"
              min="0"
              step="1"
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(e.target.value)}
              className={inputClass}
            />
          </Field>
          <p className="mt-1 font-sans text-xs text-charcoal/60">
            Orders with a cart subtotal at or above this amount get free
            delivery, regardless of the method chosen.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveNotice}
          disabled={savingNotice}
          className="mt-3 rounded-md bg-espresso px-5 py-2.5 font-sans text-sm uppercase tracking-[0.2em] text-ivory disabled:opacity-50"
        >
          {savingNotice ? "Saving…" : noticeSaved ? "Saved" : "Save Settings"}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl text-espresso">
          Delivery Options
        </h2>
        <button
          type="button"
          onClick={startAdd}
          className="rounded-md bg-espresso px-5 py-2.5 font-sans text-sm uppercase tracking-[0.2em] text-ivory"
        >
          + Add Delivery Option
        </button>
      </div>

      {formState && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-md border border-blush p-6"
        >
          <h3 className="font-heading text-lg text-espresso">
            {formState.id ? "Edit Delivery Option" : "New Delivery Option"}
          </h3>

          <Field label="Category">
            <select
              value={formState.category}
              onChange={(e) =>
                setFormState(
                  (f) =>
                    f && {
                      ...f,
                      category: e.target.value as DeliveryOption["category"],
                    },
                )
              }
              className={inputClass}
            >
              {Object.entries(DELIVERY_CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Name">
            <input
              required
              value={formState.name}
              onChange={(e) =>
                setFormState((f) => f && { ...f, name: e.target.value })
              }
              className={inputClass}
            />
          </Field>

          <Field label="Description">
            <textarea
              value={formState.description}
              onChange={(e) =>
                setFormState((f) => f && { ...f, description: e.target.value })
              }
              rows={3}
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (₦)">
              <input
                type="number"
                min="0"
                step="0.01"
                value={formState.price}
                onChange={(e) =>
                  setFormState((f) => f && { ...f, price: e.target.value })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Delivery Time">
              <input
                placeholder="3-5 working days"
                value={formState.delivery_time}
                onChange={(e) =>
                  setFormState(
                    (f) => f && { ...f, delivery_time: e.target.value },
                  )
                }
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Display Order">
            <input
              type="number"
              value={formState.display_order}
              onChange={(e) =>
                setFormState(
                  (f) => f && { ...f, display_order: e.target.value },
                )
              }
              className={inputClass}
            />
          </Field>

          <label className="flex items-center gap-2 font-sans text-sm text-charcoal">
            <input
              type="checkbox"
              checked={formState.active}
              onChange={(e) =>
                setFormState((f) => f && { ...f, active: e.target.checked })
              }
            />
            Active (visible at checkout)
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

      <div className="flex flex-col gap-8">
        {grouped.map((group) => (
          <div key={group.category} className="flex flex-col gap-3">
            <h3 className="font-heading text-lg text-espresso">
              {group.label}
            </h3>
            <div className="overflow-x-auto rounded-md border border-blush">
              <table className="w-full border-collapse text-left font-sans text-sm">
                <thead>
                  <tr className="border-b border-blush bg-blush/30 text-xs uppercase tracking-[0.1em] text-bronze">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Delivery Time</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {group.options.map((option) => (
                    <tr
                      key={option.id}
                      className="border-b border-blush/60 last:border-0"
                    >
                      <td className="px-4 py-3 text-charcoal">{option.name}</td>
                      <td className="px-4 py-3 text-charcoal/70">
                        {option.price > 0 ? formatNaira(option.price) : "—"}
                      </td>
                      <td className="px-4 py-3 text-charcoal/70">
                        {option.delivery_time ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 text-xs uppercase tracking-wide ${
                            option.active
                              ? "bg-blush text-espresso"
                              : "bg-charcoal/10 text-charcoal/50"
                          }`}
                        >
                          {option.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => startEdit(option)}
                          className="mr-3 text-bronze underline underline-offset-4"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(option)}
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
          </div>
        ))}
      </div>
    </div>
  );
}
