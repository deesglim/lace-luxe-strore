"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { friendlyAdminErrorMessage } from "@/lib/adminErrors";
import { createClient } from "@/lib/supabase/client";
import type { AdminReview } from "@/lib/reviews";

const FILTERS = ["all", "pending", "approved"] as const;
type Filter = (typeof FILTERS)[number];

const FILTER_LABELS: Record<Filter, string> = {
  all: "All",
  pending: "Pending",
  approved: "Approved",
};

const REVIEW_SELECT =
  "id, product_id, customer_name, rating, comment, approved, created_at, products(name, slug)";

const inputClass =
  "rounded-md border border-charcoal/20 bg-ivory px-3 py-2 font-sans text-sm text-charcoal focus:border-espresso focus:outline-none";

function tabClass(active: boolean) {
  return `px-3 py-1.5 font-sans text-xs uppercase tracking-[0.15em] ${
    active
      ? "bg-espresso text-ivory"
      : "border border-charcoal/20 text-charcoal/70 hover:border-bronze"
  }`;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 font-sans text-sm text-charcoal">
      <span className="text-xs uppercase tracking-[0.15em] text-bronze">{label}</span>
      {children}
    </label>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span aria-hidden className="text-bronze">
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </span>
  );
}

// Mirrors the products(name, slug) join shape used by getAllReviewsForAdmin,
// so a freshly inserted/updated row can be added straight into local state
// without a full page reload.
function mapRow(row: {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  comment: string | null;
  approved: boolean;
  created_at: string;
  products: { name: string; slug: string } | { name: string; slug: string }[] | null;
}): AdminReview | null {
  const product = Array.isArray(row.products) ? row.products[0] : row.products;
  if (!product) return null;
  return {
    id: row.id,
    productId: row.product_id,
    productName: product.name,
    productSlug: product.slug,
    customerName: row.customer_name,
    rating: row.rating,
    comment: row.comment,
    approved: row.approved,
    createdAt: row.created_at,
  };
}

type ProductOption = { id: string; name: string };

type FormState = {
  id?: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  approved: boolean;
};

function emptyForm(productOptions: ProductOption[]): FormState {
  return {
    productId: productOptions[0]?.id ?? "",
    customerName: "",
    rating: 5,
    comment: "",
    approved: true,
  };
}

function toFormState(review: AdminReview): FormState {
  return {
    id: review.id,
    productId: review.productId,
    customerName: review.customerName,
    rating: review.rating,
    comment: review.comment ?? "",
    approved: review.approved,
  };
}

export default function ReviewsManager({
  initialReviews,
  productOptions,
}: {
  initialReviews: AdminReview[];
  productOptions: ProductOption[];
}) {
  const supabase = createClient();

  const [reviews, setReviews] = useState<AdminReview[]>(initialReviews);
  const [filter, setFilter] = useState<Filter>("all");
  const [formState, setFormState] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = reviews.filter((review) => {
    if (filter === "pending") return !review.approved;
    if (filter === "approved") return review.approved;
    return true;
  });

  function startAdd() {
    setError(null);
    setFormState(emptyForm(productOptions));
  }

  function startEdit(review: AdminReview) {
    setError(null);
    setFormState(toFormState(review));
  }

  function cancelForm() {
    setFormState(null);
    setError(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!formState) return;

    if (!formState.productId) {
      setError("Choose a product.");
      return;
    }
    if (!formState.customerName.trim()) {
      setError("Enter a customer name.");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      product_id: formState.productId,
      customer_name: formState.customerName.trim(),
      rating: formState.rating,
      comment: formState.comment.trim() || null,
      approved: formState.approved,
    };

    if (formState.id) {
      const { data, error: updateError } = await supabase
        .from("reviews")
        .update(payload)
        .eq("id", formState.id)
        .select(REVIEW_SELECT)
        .single();

      const mapped = data ? mapRow(data) : null;
      if (updateError || !mapped) {
        setError(friendlyAdminErrorMessage(updateError, "Could not save changes."));
        setSaving(false);
        return;
      }

      setReviews((current) => current.map((r) => (r.id === mapped.id ? mapped : r)));
    } else {
      const { data, error: insertError } = await supabase
        .from("reviews")
        .insert(payload)
        .select(REVIEW_SELECT)
        .single();

      const mapped = data ? mapRow(data) : null;
      if (insertError || !mapped) {
        setError(friendlyAdminErrorMessage(insertError, "Could not add review."));
        setSaving(false);
        return;
      }

      setReviews((current) => [mapped, ...current]);
    }

    setSaving(false);
    setFormState(null);
  }

  async function toggleApproved(review: AdminReview) {
    setPendingId(review.id);
    setError(null);

    const { error: updateError } = await supabase
      .from("reviews")
      .update({ approved: !review.approved })
      .eq("id", review.id);

    if (updateError) {
      setError(friendlyAdminErrorMessage(updateError, "Could not update review."));
      setPendingId(null);
      return;
    }

    setReviews((current) =>
      current.map((r) => (r.id === review.id ? { ...r, approved: !r.approved } : r)),
    );
    setPendingId(null);
  }

  async function handleDelete(review: AdminReview) {
    const confirmed = window.confirm(
      `Delete this review from ${review.customerName}? This can't be undone.`,
    );
    if (!confirmed) return;

    setPendingId(review.id);
    setError(null);

    const { error: deleteError } = await supabase.from("reviews").delete().eq("id", review.id);

    if (deleteError) {
      setError(friendlyAdminErrorMessage(deleteError, "Could not delete review."));
      setPendingId(null);
      return;
    }

    setReviews((current) => current.filter((r) => r.id !== review.id));
    setPendingId(null);
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <p className="rounded-md border border-bronze bg-blush/40 px-4 py-3 font-sans text-sm text-espresso">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={tabClass(filter === f)}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={startAdd}
          className="shrink-0 rounded-md bg-espresso px-5 py-2.5 font-sans text-sm uppercase tracking-[0.2em] text-ivory"
        >
          + Add Review
        </button>
      </div>

      {formState && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-md border border-blush p-6"
        >
          <h3 className="font-heading text-lg text-espresso">
            {formState.id ? "Edit Review" : "New Review"}
          </h3>

          <Field label="Product">
            <select
              value={formState.productId}
              onChange={(e) =>
                setFormState((f) => f && { ...f, productId: e.target.value })
              }
              className={inputClass}
            >
              {productOptions.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Customer Name">
            <input
              value={formState.customerName}
              onChange={(e) =>
                setFormState((f) => f && { ...f, customerName: e.target.value })
              }
              className={inputClass}
            />
          </Field>

          <div className="flex flex-col gap-1">
            <span className="font-sans text-xs uppercase tracking-[0.15em] text-bronze">
              Rating
            </span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormState((f) => f && { ...f, rating: star })}
                  aria-label={`${star} star${star > 1 ? "s" : ""}`}
                  className="text-2xl leading-none text-bronze"
                >
                  {formState.rating >= star ? "★" : "☆"}
                </button>
              ))}
            </div>
          </div>

          <Field label="Comment (optional)">
            <textarea
              value={formState.comment}
              onChange={(e) =>
                setFormState((f) => f && { ...f, comment: e.target.value })
              }
              rows={4}
              className={inputClass}
            />
          </Field>

          <label className="flex items-center gap-2 font-sans text-sm text-charcoal">
            <input
              type="checkbox"
              checked={formState.approved}
              onChange={(e) =>
                setFormState((f) => f && { ...f, approved: e.target.checked })
              }
            />
            Approved (visible on the product page)
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

      {filtered.length === 0 ? (
        <p className="font-sans text-sm text-charcoal/70">
          No {filter === "all" ? "" : `${filter} `}reviews yet.
        </p>
      ) : (
        <div className="overflow-x-auto border border-blush">
          <table className="w-full border-collapse text-left font-sans text-sm">
            <thead>
              <tr className="border-b border-blush bg-blush/30 text-xs uppercase tracking-[0.1em] text-bronze">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Comment</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((review) => (
                <tr key={review.id} className="border-b border-blush/60 last:border-0 align-top">
                  <td className="px-4 py-3 text-charcoal">{review.productName}</td>
                  <td className="px-4 py-3 text-charcoal">{review.customerName}</td>
                  <td className="px-4 py-3">
                    <Stars rating={review.rating} />
                  </td>
                  <td className="max-w-xs px-4 py-3 text-charcoal/70">
                    {review.comment || <span className="text-charcoal/40">—</span>}
                  </td>
                  <td className="px-4 py-3 text-charcoal/70">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 font-sans text-xs uppercase tracking-wide ${
                        review.approved
                          ? "bg-espresso text-ivory"
                          : "bg-charcoal/10 text-charcoal/60"
                      }`}
                    >
                      {review.approved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(review)}
                        className="font-sans text-xs uppercase tracking-[0.1em] text-bronze underline underline-offset-4"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleApproved(review)}
                        disabled={pendingId === review.id}
                        className="font-sans text-xs uppercase tracking-[0.1em] text-bronze underline underline-offset-4 disabled:opacity-50"
                      >
                        {review.approved ? "Unapprove" : "Approve"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(review)}
                        disabled={pendingId === review.id}
                        className="font-sans text-xs uppercase tracking-[0.1em] text-charcoal/50 underline underline-offset-4 hover:text-charcoal disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
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
