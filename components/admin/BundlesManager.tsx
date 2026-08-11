"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import ImageUploader, { type ImageItem } from "@/components/admin/ImageUploader";
import { friendlyAdminErrorMessage } from "@/lib/adminErrors";
import type { BundleOfferWithItems } from "@/lib/bundles";
import { formatNaira } from "@/lib/format";
import type { ProductVariantOption } from "@/lib/products";
import { getProductImageStoragePath } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";
import type { BundleOffer } from "@/types";

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

type BundleItemRow = {
  key: string;
  productId: string;
  variantId: string;
  colorId: string;
  quantityRequired: string;
};

function emptyItemRow(): BundleItemRow {
  return {
    key: crypto.randomUUID(),
    productId: "",
    variantId: "",
    colorId: "",
    quantityRequired: "1",
  };
}

type FormState = {
  id?: string;
  name: string;
  description: string;
  bundleType: BundleOffer["bundle_type"];
  bundlePrice: string;
  requiredQuantity: string;
  scope: "sitewide" | "category";
  scopeReference: string;
  items: BundleItemRow[];
  active: boolean;
  startsAt: string;
  endsAt: string;
};

function emptyForm(): FormState {
  return {
    name: "",
    description: "",
    bundleType: "specific_products",
    bundlePrice: "",
    requiredQuantity: "",
    scope: "sitewide",
    scopeReference: "",
    items: [emptyItemRow()],
    active: true,
    startsAt: "",
    endsAt: "",
  };
}

function toFormState(bundle: BundleOfferWithItems): FormState {
  return {
    id: bundle.id,
    name: bundle.name,
    description: bundle.description ?? "",
    bundleType: bundle.bundle_type,
    bundlePrice: String(bundle.bundle_price),
    requiredQuantity: bundle.required_quantity ? String(bundle.required_quantity) : "",
    scope: bundle.scope === "category" ? "category" : "sitewide",
    scopeReference: bundle.scope_reference ?? "",
    items:
      bundle.items.length > 0
        ? bundle.items.map((item) => ({
            key: crypto.randomUUID(),
            productId: item.product_id,
            variantId: item.variant_id ?? "",
            colorId: item.color_id ?? "",
            quantityRequired: String(item.quantity_required),
          }))
        : [emptyItemRow()],
    active: bundle.active,
    startsAt: bundle.starts_at ? bundle.starts_at.slice(0, 10) : "",
    endsAt: bundle.ends_at ? bundle.ends_at.slice(0, 10) : "",
  };
}

const BUNDLE_FIELDS =
  "id, name, description, bundle_type, bundle_price, image_url, required_quantity, scope, scope_reference, active, starts_at, ends_at, created_at, bundle_offer_items(product_id, variant_id, color_id, quantity_required)";

function mapRow(row: {
  bundle_offer_items:
    | { product_id: string; variant_id: string | null; color_id: string | null; quantity_required: number }[]
    | null;
  [key: string]: unknown;
}): BundleOfferWithItems {
  const { bundle_offer_items, ...fields } = row;
  return {
    ...(fields as Omit<BundleOfferWithItems, "items">),
    items: bundle_offer_items ?? [],
  };
}

function typeLabel(bundle: BundleOffer): string {
  return bundle.bundle_type === "specific_products"
    ? "Specific Products"
    : "Flexible Quantity";
}

function dateRangeLabel(bundle: BundleOffer): string {
  const start = bundle.starts_at ? new Date(bundle.starts_at).toLocaleDateString() : null;
  const end = bundle.ends_at ? new Date(bundle.ends_at).toLocaleDateString() : null;

  if (!start && !end) return "No limit";
  if (start && !end) return `From ${start}`;
  if (!start && end) return `Until ${end}`;
  return `${start} – ${end}`;
}

export default function BundlesManager({
  initialBundles,
  laceTypes,
  productsWithVariants,
}: {
  initialBundles: BundleOfferWithItems[];
  laceTypes: string[];
  productsWithVariants: ProductVariantOption[];
}) {
  const supabase = createClient();

  const [bundles, setBundles] = useState<BundleOfferWithItems[]>(initialBundles);
  const [formState, setFormState] = useState<FormState | null>(null);
  const [image, setImage] = useState<ImageItem[]>([]);
  const [removedImageUrl, setRemovedImageUrl] = useState<string | null>(null);
  const [folderId, setFolderId] = useState<string>("");
  const [uploadingKeys, setUploadingKeys] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function findProduct(productId: string) {
    return productsWithVariants.find((product) => product.id === productId);
  }

  function findVariant(productId: string, variantId: string) {
    return findProduct(productId)?.product_variants.find(
      (variant) => variant.id === variantId,
    );
  }

  function startAdd() {
    setError(null);
    setFormState(emptyForm());
    setImage([]);
    setRemovedImageUrl(null);
    setFolderId(crypto.randomUUID());
  }

  function startEdit(bundle: BundleOfferWithItems) {
    setError(null);
    setFormState(toFormState(bundle));
    setImage(bundle.image_url ? [{ key: bundle.image_url, kind: "existing", url: bundle.image_url }] : []);
    setRemovedImageUrl(null);
    setFolderId(bundle.id);
  }

  function cancelForm() {
    setFormState(null);
    setError(null);
  }

  function handleImageChange(next: ImageItem[]) {
    // Single-image mode: whatever was just added/kept last wins, so this
    // reuses the multi-image uploader component without needing a variant
    // of it — dropping a new file simply replaces the previous one.
    const capped = next.slice(-1);
    const droppedExisting = image.find(
      (item) => item.kind === "existing" && !capped.some((n) => n.key === item.key),
    );
    if (droppedExisting?.kind === "existing") {
      setRemovedImageUrl(droppedExisting.url);
    }
    setImage(capped);
  }

  function updateItemRow(key: string, patch: Partial<BundleItemRow>) {
    setFormState(
      (f) =>
        f && {
          ...f,
          items: f.items.map((row) => (row.key === key ? { ...row, ...patch } : row)),
        },
    );
  }

  function addItemRow() {
    setFormState((f) => f && { ...f, items: [...f.items, emptyItemRow()] });
  }

  function removeItemRow(key: string) {
    setFormState(
      (f) =>
        f && {
          ...f,
          items: f.items.length > 1 ? f.items.filter((row) => row.key !== key) : f.items,
        },
    );
  }

  const originalCombinedPrice =
    formState?.bundleType === "specific_products"
      ? formState.items.reduce((sum, row) => {
          const variant = findVariant(row.productId, row.variantId);
          if (!variant) return sum;
          return sum + variant.price * (Number(row.quantityRequired) || 0);
        }, 0)
      : 0;

  async function uploadImage(): Promise<string | null> {
    const item = image[0];
    if (!item) return null;
    if (item.kind === "existing") return item.url;

    setUploadingKeys((keys) => new Set(keys).add(item.key));
    try {
      const ext = item.file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `bundles/${folderId}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, item.file, { cacheControl: "3600", upsert: false });
      if (uploadError) {
        throw new Error(`Failed to upload ${item.file.name}: ${uploadError.message}`);
      }
      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(path);
      return publicUrl;
    } finally {
      setUploadingKeys((keys) => {
        const next = new Set(keys);
        next.delete(item.key);
        return next;
      });
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!formState) return;

    const name = formState.name.trim();
    if (!name) {
      setError("Name is required.");
      return;
    }

    const bundlePrice = Number(formState.bundlePrice);
    if (!bundlePrice || bundlePrice <= 0) {
      setError("Enter a bundle price greater than 0.");
      return;
    }

    let requiredQuantity: number | null = null;
    let scope: "sitewide" | "category" | null = null;
    let scopeReference: string | null = null;
    const validItems: {
      product_id: string;
      variant_id: string;
      color_id: string | null;
      quantity_required: number;
    }[] = [];

    if (formState.bundleType === "flexible_quantity") {
      requiredQuantity = Number(formState.requiredQuantity);
      if (!requiredQuantity || requiredQuantity <= 0) {
        setError("Enter a required quantity greater than 0.");
        return;
      }
      scope = formState.scope;
      if (scope === "category") {
        if (!formState.scopeReference) {
          setError("Choose a category.");
          return;
        }
        scopeReference = formState.scopeReference;
      }
    } else {
      for (const row of formState.items) {
        if (!row.productId) continue;
        if (!row.variantId) {
          setError("Pick an exact size for every product in the bundle.");
          return;
        }
        const variant = findVariant(row.productId, row.variantId);
        const hasColors = (variant?.product_variant_colors.length ?? 0) > 0;
        if (hasColors && !row.colorId) {
          setError("Pick a color for every item whose size has colors.");
          return;
        }
        validItems.push({
          product_id: row.productId,
          variant_id: row.variantId,
          color_id: hasColors ? row.colorId : null,
          quantity_required: Math.max(1, Number(row.quantityRequired) || 1),
        });
      }
      if (validItems.length === 0) {
        setError("Add at least one product to the bundle.");
        return;
      }
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

    let imageUrl: string | null;
    try {
      imageUrl = await uploadImage();
    } catch (uploadErr) {
      setError(uploadErr instanceof Error ? uploadErr.message : "Could not upload image.");
      setSaving(false);
      return;
    }

    const payload = {
      name,
      description: formState.description.trim() || null,
      bundle_type: formState.bundleType,
      bundle_price: bundlePrice,
      image_url: imageUrl,
      required_quantity: requiredQuantity,
      scope,
      scope_reference: scopeReference,
      active: formState.active,
      starts_at: formState.startsAt ? `${formState.startsAt}T00:00:00` : null,
      ends_at: formState.endsAt ? `${formState.endsAt}T23:59:59` : null,
    };

    let bundleId = formState.id;

    if (bundleId) {
      const { error: updateError } = await supabase
        .from("bundle_offers")
        .update(payload)
        .eq("id", bundleId);

      if (updateError) {
        setError(friendlyAdminErrorMessage(updateError, "Could not save changes."));
        setSaving(false);
        return;
      }
    } else {
      const { data, error: insertError } = await supabase
        .from("bundle_offers")
        .insert(payload)
        .select("id")
        .single();

      if (insertError || !data) {
        setError(friendlyAdminErrorMessage(insertError, "Could not create bundle."));
        setSaving(false);
        return;
      }
      bundleId = data.id;
    }

    // Replace-all for items — simplest correct approach given these are
    // always small lists, and avoids diffing add/remove/edit separately.
    const { error: deleteItemsError } = await supabase
      .from("bundle_offer_items")
      .delete()
      .eq("bundle_offer_id", bundleId);

    if (deleteItemsError) {
      setError(friendlyAdminErrorMessage(deleteItemsError, "Could not save changes."));
      setSaving(false);
      return;
    }

    if (formState.bundleType === "specific_products" && validItems.length > 0) {
      const { error: insertItemsError } = await supabase.from("bundle_offer_items").insert(
        validItems.map((item) => ({
          bundle_offer_id: bundleId,
          product_id: item.product_id,
          variant_id: item.variant_id,
          color_id: item.color_id,
          quantity_required: item.quantity_required,
        })),
      );

      if (insertItemsError) {
        setError(friendlyAdminErrorMessage(insertItemsError, "Could not save changes."));
        setSaving(false);
        return;
      }
    }

    if (removedImageUrl) {
      const path = getProductImageStoragePath(removedImageUrl);
      if (path) {
        await supabase.storage.from("product-images").remove([path]).catch(() => {});
      }
    }

    const { data: refreshed, error: refetchError } = await supabase
      .from("bundle_offers")
      .select(BUNDLE_FIELDS)
      .eq("id", bundleId)
      .single();

    if (refetchError || !refreshed) {
      setError(
        friendlyAdminErrorMessage(
          refetchError,
          "Saved, but couldn't refresh the list — reload to see changes.",
        ),
      );
      setSaving(false);
      return;
    }

    const savedBundle = mapRow(refreshed);
    setBundles((current) => {
      const exists = current.some((b) => b.id === savedBundle.id);
      return exists
        ? current.map((b) => (b.id === savedBundle.id ? savedBundle : b))
        : [savedBundle, ...current];
    });

    setSaving(false);
    setFormState(null);
  }

  async function handleDelete(bundle: BundleOfferWithItems) {
    const confirmed = window.confirm(
      `Delete "${bundle.name}"? This can't be undone.`,
    );
    if (!confirmed) return;

    const { error: deleteError } = await supabase
      .from("bundle_offers")
      .delete()
      .eq("id", bundle.id);

    if (deleteError) {
      setError(friendlyAdminErrorMessage(deleteError, "Could not delete bundle."));
      return;
    }

    if (bundle.image_url) {
      const path = getProductImageStoragePath(bundle.image_url);
      if (path) {
        await supabase.storage.from("product-images").remove([path]).catch(() => {});
      }
    }

    setBundles((current) => current.filter((b) => b.id !== bundle.id));
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
          Combo deals — a cart can qualify for several, but only the
          best-value one ever applies (compared against promotions too).
          Specific Products bundles also appear as shoppable offers in the
          storefront.
        </p>
        <button
          type="button"
          onClick={startAdd}
          className="shrink-0 rounded-md bg-espresso px-5 py-2.5 font-sans text-sm uppercase tracking-[0.2em] text-ivory"
        >
          + Add Bundle
        </button>
      </div>

      {formState && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-md border border-blush p-6"
        >
          <h3 className="font-heading text-lg text-espresso">
            {formState.id ? "Edit Bundle" : "New Bundle"}
          </h3>

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

          <Field label="Description (optional)">
            <textarea
              value={formState.description}
              onChange={(e) =>
                setFormState((f) => f && { ...f, description: e.target.value })
              }
              rows={2}
              className={inputClass}
            />
          </Field>

          <Field label="Offer Image (optional)">
            <ImageUploader
              images={image}
              onChange={handleImageChange}
              uploadingKeys={uploadingKeys}
            />
          </Field>

          <Field label="Bundle Type">
            <select
              value={formState.bundleType}
              onChange={(e) =>
                setFormState(
                  (f) =>
                    f && {
                      ...f,
                      bundleType: e.target.value as BundleOffer["bundle_type"],
                    },
                )
              }
              className={inputClass}
            >
              <option value="specific_products">Specific Products</option>
              <option value="flexible_quantity">Flexible Quantity</option>
            </select>
          </Field>

          {formState.bundleType === "specific_products" ? (
            <div className="flex flex-col gap-2">
              <span className="font-sans text-xs uppercase tracking-[0.15em] text-bronze">
                Required Products
              </span>
              <div className="flex flex-col gap-2">
                {formState.items.map((row) => {
                  const product = findProduct(row.productId);
                  const variant = findVariant(row.productId, row.variantId);
                  const colors = variant?.product_variant_colors ?? [];

                  return (
                    <div
                      key={row.key}
                      className="flex flex-col gap-2 border border-charcoal/10 p-3 sm:flex-row sm:items-center"
                    >
                      <select
                        value={row.productId}
                        onChange={(e) =>
                          updateItemRow(row.key, {
                            productId: e.target.value,
                            variantId: "",
                            colorId: "",
                          })
                        }
                        className={`${inputClass} flex-1`}
                      >
                        <option value="" disabled>
                          Select a product
                        </option>
                        {productsWithVariants.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>

                      {product && (
                        <select
                          value={row.variantId}
                          onChange={(e) =>
                            updateItemRow(row.key, {
                              variantId: e.target.value,
                              colorId: "",
                            })
                          }
                          className={`${inputClass} flex-1`}
                        >
                          <option value="" disabled>
                            Select a size
                          </option>
                          {product.product_variants.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.size_label} — {formatNaira(v.price)}
                            </option>
                          ))}
                        </select>
                      )}

                      {colors.length > 0 && (
                        <select
                          value={row.colorId}
                          onChange={(e) =>
                            updateItemRow(row.key, { colorId: e.target.value })
                          }
                          className={`${inputClass} flex-1`}
                        >
                          <option value="" disabled>
                            Select a color
                          </option>
                          {colors.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.color_name}
                            </option>
                          ))}
                        </select>
                      )}

                      <input
                        type="number"
                        min="1"
                        value={row.quantityRequired}
                        onChange={(e) =>
                          updateItemRow(row.key, { quantityRequired: e.target.value })
                        }
                        className={`${inputClass} w-full sm:w-20`}
                        aria-label="Quantity required"
                      />
                      <button
                        type="button"
                        onClick={() => removeItemRow(row.key)}
                        disabled={formState.items.length === 1}
                        className="shrink-0 font-sans text-xs text-bronze underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={addItemRow}
                className="self-start font-sans text-xs text-bronze underline underline-offset-4"
              >
                + Add Product
              </button>
              <p className="font-sans text-xs text-charcoal/60">
                Original combined price: {formatNaira(originalCombinedPrice)}
              </p>
            </div>
          ) : (
            <>
              <Field label="Required Quantity">
                <input
                  type="number"
                  min="1"
                  value={formState.requiredQuantity}
                  onChange={(e) =>
                    setFormState(
                      (f) => f && { ...f, requiredQuantity: e.target.value },
                    )
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Scope">
                <select
                  value={formState.scope}
                  onChange={(e) =>
                    setFormState(
                      (f) =>
                        f && {
                          ...f,
                          scope: e.target.value as "sitewide" | "category",
                          scopeReference: "",
                        },
                    )
                  }
                  className={inputClass}
                >
                  <option value="sitewide">Sitewide</option>
                  <option value="category">Category</option>
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
            </>
          )}

          <Field
            label={`Bundle Price (₦) — flat total when it qualifies${
              formState.bundleType === "specific_products"
                ? ` (original: ${formatNaira(originalCombinedPrice)})`
                : ""
            }`}
          >
            <input
              type="number"
              min="0"
              step="0.01"
              value={formState.bundlePrice}
              onChange={(e) =>
                setFormState((f) => f && { ...f, bundlePrice: e.target.value })
              }
              className={inputClass}
            />
          </Field>

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

      {bundles.length === 0 ? (
        <p className="font-sans text-sm text-charcoal/70">
          No bundles yet. Add your first combo deal.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-blush">
          <table className="w-full border-collapse text-left font-sans text-sm">
            <thead>
              <tr className="border-b border-blush bg-blush/30 text-xs uppercase tracking-[0.1em] text-bronze">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Dates</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {bundles.map((bundle) => (
                <tr key={bundle.id} className="border-b border-blush/60 last:border-0">
                  <td className="px-4 py-3 text-charcoal">{bundle.name}</td>
                  <td className="px-4 py-3 text-charcoal/70">{typeLabel(bundle)}</td>
                  <td className="px-4 py-3 text-charcoal/70">
                    {formatNaira(bundle.bundle_price)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 text-xs uppercase tracking-wide ${
                        bundle.active
                          ? "bg-blush text-espresso"
                          : "bg-charcoal/10 text-charcoal/50"
                      }`}
                    >
                      {bundle.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-charcoal/70">
                    {dateRangeLabel(bundle)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => startEdit(bundle)}
                      className="mr-3 text-bronze underline underline-offset-4"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(bundle)}
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
