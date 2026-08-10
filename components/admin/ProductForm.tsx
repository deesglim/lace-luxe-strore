"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slugify";
import { getProductImageStoragePath } from "@/lib/storage";
import type { AdminRecommendationRow, ProductWithVariants } from "@/lib/products";
import ImageUploader, {
  type ImageItem,
} from "@/components/admin/ImageUploader";

type ColorRow = {
  key: string;
  id?: string;
  color_name: string;
  stock_quantity: string;
};

function emptyColorRow(): ColorRow {
  return {
    key: crypto.randomUUID(),
    color_name: "",
    stock_quantity: "0",
  };
}

type VariantRow = {
  key: string;
  id?: string;
  size_label: string;
  price: string;
  compareAtPrice: string;
  stock_quantity: string;
  sku: string;
  colors: ColorRow[];
};

function emptyVariantRow(): VariantRow {
  return {
    key: crypto.randomUUID(),
    size_label: "",
    price: "",
    compareAtPrice: "",
    stock_quantity: "0",
    sku: "",
    colors: [],
  };
}

const inputClass =
  "border border-charcoal/20 bg-ivory px-3 py-2 font-sans text-sm text-charcoal focus:border-espresso focus:outline-none";

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

function RepeatableTextList({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-sans text-xs uppercase tracking-[0.15em] text-bronze">
        {label}
      </span>
      <div className="flex flex-col gap-2">
        {values.map((value, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              value={value}
              onChange={(e) => {
                const next = [...values];
                next[index] = e.target.value;
                onChange(next);
              }}
              placeholder={placeholder}
              className={`${inputClass} flex-1`}
            />
            <button
              type="button"
              onClick={() => onChange(values.filter((_, i) => i !== index))}
              disabled={values.length === 1}
              className="font-sans text-sm text-bronze underline underline-offset-4 disabled:cursor-not-allowed disabled:text-charcoal/30 disabled:no-underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...values, ""])}
        className="self-start font-sans text-sm text-bronze underline underline-offset-4"
      >
        + Add point
      </button>
    </div>
  );
}

type RecommendationRow = {
  key: string;
  id?: string;
  recommended_product_id: string;
  reason_label: string;
};

function emptyRecommendationRow(): RecommendationRow {
  return {
    key: crypto.randomUUID(),
    recommended_product_id: "",
    reason_label: "",
  };
}

export default function ProductForm({
  product,
  productOptions = [],
  recommendations: initialRecommendations = [],
}: {
  product?: ProductWithVariants;
  productOptions?: { id: string; name: string }[];
  recommendations?: AdminRecommendationRow[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = Boolean(product);

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [description, setDescription] = useState(product?.description ?? "");
  const [laceType, setLaceType] = useState(product?.lace_type ?? "");
  const [active, setActive] = useState(product?.active ?? true);
  const [isBestSeller, setIsBestSeller] = useState(product?.is_best_seller ?? false);
  const [folderId] = useState(() => product?.id ?? crypto.randomUUID());
  const [images, setImages] = useState<ImageItem[]>(
    product?.images.map((url) => ({ key: url, kind: "existing", url })) ?? [],
  );
  const [removedExistingUrls, setRemovedExistingUrls] = useState<string[]>([]);
  const [uploadingKeys, setUploadingKeys] = useState<Set<string>>(new Set());
  const [variants, setVariants] = useState<VariantRow[]>(
    product && product.product_variants.length > 0
      ? product.product_variants.map((variant) => ({
          key: variant.id,
          id: variant.id,
          size_label: variant.size_label,
          price: String(variant.price),
          compareAtPrice:
            variant.compare_at_price != null ? String(variant.compare_at_price) : "",
          stock_quantity: String(variant.stock_quantity),
          sku: variant.sku ?? "",
          colors: variant.product_variant_colors.map((color) => ({
            key: color.id,
            id: color.id,
            color_name: color.color_name,
            stock_quantity: String(color.stock_quantity),
          })),
        }))
      : [emptyVariantRow()],
  );
  const [removedVariantIds, setRemovedVariantIds] = useState<string[]>([]);
  const [removedColorIds, setRemovedColorIds] = useState<string[]>([]);
  const [expandedVariantColors, setExpandedVariantColors] = useState<Set<string>>(
    () =>
      new Set(
        (product?.product_variants ?? [])
          .filter((variant) => variant.product_variant_colors.length > 0)
          .map((variant) => variant.id),
      ),
  );
  const [whyChoose, setWhyChoose] = useState<string[]>(
    product?.why_choose && product.why_choose.length > 0
      ? product.why_choose
      : [""],
  );
  const [whyNotChoose, setWhyNotChoose] = useState<string[]>(
    product?.why_not_choose && product.why_not_choose.length > 0
      ? product.why_not_choose
      : [""],
  );
  const [recommendations, setRecommendations] = useState<RecommendationRow[]>(
    initialRecommendations.map((rec) => ({
      key: rec.id,
      id: rec.id,
      recommended_product_id: rec.recommended_product_id,
      reason_label: rec.reason_label ?? "",
    })),
  );
  const [removedRecommendationIds, setRemovedRecommendationIds] = useState<
    string[]
  >([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  function updateVariant(key: string, field: keyof VariantRow, value: string) {
    setVariants((rows) =>
      rows.map((row) => (row.key === key ? { ...row, [field]: value } : row)),
    );
  }

  function addVariantRow() {
    setVariants((rows) => [...rows, emptyVariantRow()]);
  }

  function removeVariantRow(key: string) {
    const target = variants.find((row) => row.key === key);
    if (target?.id) {
      setRemovedVariantIds((ids) => [...ids, target.id!]);
    }
    setVariants((rows) => rows.filter((row) => row.key !== key));
  }

  function updateColor(
    variantKey: string,
    colorKey: string,
    field: "color_name" | "stock_quantity",
    value: string,
  ) {
    setVariants((rows) =>
      rows.map((row) =>
        row.key === variantKey
          ? {
              ...row,
              colors: row.colors.map((color) =>
                color.key === colorKey ? { ...color, [field]: value } : color,
              ),
            }
          : row,
      ),
    );
  }

  function addColorRow(variantKey: string) {
    setVariants((rows) =>
      rows.map((row) =>
        row.key === variantKey
          ? { ...row, colors: [...row.colors, emptyColorRow()] }
          : row,
      ),
    );
    setExpandedVariantColors((keys) => new Set(keys).add(variantKey));
  }

  function removeColorRow(variantKey: string, colorKey: string) {
    const variant = variants.find((row) => row.key === variantKey);
    const target = variant?.colors.find((color) => color.key === colorKey);
    if (target?.id) {
      setRemovedColorIds((ids) => [...ids, target.id!]);
    }
    setVariants((rows) =>
      rows.map((row) =>
        row.key === variantKey
          ? { ...row, colors: row.colors.filter((color) => color.key !== colorKey) }
          : row,
      ),
    );
  }

  function toggleColorsExpanded(variantKey: string) {
    setExpandedVariantColors((keys) => {
      const next = new Set(keys);
      if (next.has(variantKey)) {
        next.delete(variantKey);
      } else {
        next.add(variantKey);
      }
      return next;
    });
  }

  function updateRecommendation(
    key: string,
    field: "recommended_product_id" | "reason_label",
    value: string,
  ) {
    setRecommendations((rows) =>
      rows.map((row) => (row.key === key ? { ...row, [field]: value } : row)),
    );
  }

  function addRecommendationRow() {
    setRecommendations((rows) => [...rows, emptyRecommendationRow()]);
  }

  function removeRecommendationRow(key: string) {
    const target = recommendations.find((row) => row.key === key);
    if (target?.id) {
      setRemovedRecommendationIds((ids) => [...ids, target.id!]);
    }
    setRecommendations((rows) => rows.filter((row) => row.key !== key));
  }

  function handleImagesChange(next: ImageItem[]) {
    const nextUrls = new Set(
      next.filter((item) => item.kind === "existing").map((item) => item.url),
    );
    const removed = images
      .filter((item) => item.kind === "existing" && !nextUrls.has(item.url))
      .map((item) => (item as Extract<ImageItem, { kind: "existing" }>).url);
    if (removed.length > 0) {
      setRemovedExistingUrls((urls) => [...urls, ...removed]);
    }
    setImages(next);
  }

  async function uploadPendingImages(): Promise<string[]> {
    const urls: string[] = [];
    for (const item of images) {
      if (item.kind === "existing") {
        urls.push(item.url);
        continue;
      }

      setUploadingKeys((keys) => new Set(keys).add(item.key));
      try {
        const ext = item.file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${folderId}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(path, item.file, { cacheControl: "3600", upsert: false });
        if (uploadError) {
          throw new Error(`Failed to upload ${item.file.name}: ${uploadError.message}`);
        }
        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(path);
        urls.push(publicUrl);
      } finally {
        setUploadingKeys((keys) => {
          const next = new Set(keys);
          next.delete(item.key);
          return next;
        });
      }
    }
    return urls;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const activeVariants = variants.filter((row) => row.id || row.size_label.trim());
    if (activeVariants.length === 0) {
      setError("Add at least one size before saving.");
      return;
    }

    for (const row of activeVariants) {
      const label = row.size_label.trim() || "one of the sizes";
      const price = Number(row.price);
      if (row.price.trim() === "" || !Number.isFinite(price) || price < 0) {
        setError(`Enter a valid, non-negative price for "${label}".`);
        return;
      }
      const stock = Number(row.stock_quantity);
      if (row.stock_quantity.trim() === "" || !Number.isFinite(stock) || stock < 0) {
        setError(`Enter a valid, non-negative stock quantity for "${label}".`);
        return;
      }
      if (row.compareAtPrice.trim()) {
        const compareAt = Number(row.compareAtPrice);
        if (!Number.isFinite(compareAt) || compareAt < 0) {
          setError(`Enter a valid, non-negative compare-at price for "${label}".`);
          return;
        }
      }
      for (const color of row.colors) {
        if (!color.id && !color.color_name.trim()) continue;
        const colorStock = Number(color.stock_quantity);
        if (color.stock_quantity.trim() === "" || !Number.isFinite(colorStock) || colorStock < 0) {
          setError(
            `Enter a valid, non-negative stock quantity for the "${color.color_name || "color"}" option on "${label}".`,
          );
          return;
        }
      }
    }

    setSaving(true);
    setError(null);

    try {
      const imageUrls = await uploadPendingImages();

      const productPayload = {
        name,
        slug,
        description: description || null,
        lace_type: laceType || null,
        active,
        is_best_seller: isBestSeller,
        images: imageUrls,
        why_choose: whyChoose.map((point) => point.trim()).filter(Boolean),
        why_not_choose: whyNotChoose.map((point) => point.trim()).filter(Boolean),
      };

      let productId = product?.id;

      if (isEditing && productId) {
        const { error: updateError } = await supabase
          .from("products")
          .update(productPayload)
          .eq("id", productId);
        if (updateError) throw updateError;
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from("products")
          .insert(productPayload)
          .select("id")
          .single();
        if (insertError) throw insertError;
        productId = inserted.id;
      }

      if (removedVariantIds.length > 0) {
        const { error: deleteError } = await supabase
          .from("product_variants")
          .delete()
          .in("id", removedVariantIds);
        if (deleteError) throw deleteError;
      }

      if (removedColorIds.length > 0) {
        const { error: deleteColorsError } = await supabase
          .from("product_variant_colors")
          .delete()
          .in("id", removedColorIds);
        if (deleteColorsError) throw deleteColorsError;
      }

      // Looping per row (rather than bulk update + bulk insert) means a
      // newly-inserted variant's id is available immediately, so its color
      // rows can be saved with the right variant_id in the same pass.
      for (const row of variants) {
        if (!row.id && !row.size_label.trim()) continue;

        let variantId = row.id;
        const variantPayload = {
          size_label: row.size_label,
          price: Number(row.price) || 0,
          compare_at_price: row.compareAtPrice.trim() ? Number(row.compareAtPrice) : null,
          stock_quantity: Number(row.stock_quantity) || 0,
          sku: row.sku || null,
        };

        if (variantId) {
          const { error: variantError } = await supabase
            .from("product_variants")
            .update(variantPayload)
            .eq("id", variantId);
          if (variantError) throw variantError;
        } else {
          const { data: insertedVariant, error: variantInsertError } = await supabase
            .from("product_variants")
            .insert({ ...variantPayload, product_id: productId })
            .select("id")
            .single();
          if (variantInsertError) throw variantInsertError;
          variantId = insertedVariant.id;
        }

        const colorsToUpdate = row.colors.filter((color) => color.id);
        const colorsToInsert = row.colors.filter(
          (color) => !color.id && color.color_name.trim(),
        );

        for (const color of colorsToUpdate) {
          const { error: colorError } = await supabase
            .from("product_variant_colors")
            .update({
              color_name: color.color_name,
              stock_quantity: Number(color.stock_quantity) || 0,
            })
            .eq("id", color.id);
          if (colorError) throw colorError;
        }

        if (colorsToInsert.length > 0) {
          const { error: colorInsertError } = await supabase
            .from("product_variant_colors")
            .insert(
              colorsToInsert.map((color) => ({
                variant_id: variantId,
                color_name: color.color_name,
                stock_quantity: Number(color.stock_quantity) || 0,
              })),
            );
          if (colorInsertError) throw colorInsertError;
        }
      }

      if (removedRecommendationIds.length > 0) {
        const { error: deleteRecError } = await supabase
          .from("product_recommendations")
          .delete()
          .in("id", removedRecommendationIds);
        if (deleteRecError) throw deleteRecError;
      }

      for (const row of recommendations) {
        if (!row.recommended_product_id) continue;

        const recommendationPayload = {
          product_id: productId,
          recommended_product_id: row.recommended_product_id,
          reason_label: row.reason_label || null,
        };

        if (row.id) {
          const { error: recUpdateError } = await supabase
            .from("product_recommendations")
            .update(recommendationPayload)
            .eq("id", row.id);
          if (recUpdateError) throw recUpdateError;
        } else {
          const { error: recInsertError } = await supabase
            .from("product_recommendations")
            .insert(recommendationPayload);
          if (recInsertError) throw recInsertError;
        }
      }

      if (removedExistingUrls.length > 0) {
        const paths = removedExistingUrls
          .map(getProductImageStoragePath)
          .filter((path): path is string => Boolean(path));
        if (paths.length > 0) {
          await supabase.storage
            .from("product-images")
            .remove(paths)
            .catch(() => {});
        }
      }

      setSaved(true);
      setTimeout(() => {
        router.push("/admin/products");
        router.refresh();
      }, 700);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong while saving.",
      );
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!product) return;
    const confirmed = window.confirm(
      `Delete "${product.name}"? This also removes all of its size variants and can't be undone.`,
    );
    if (!confirmed) return;

    setSaving(true);
    setError(null);

    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (deleteError) {
      setError(deleteError.message);
      setSaving(false);
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-8">
      {error && (
        <p className="border border-bronze bg-blush/40 px-4 py-3 font-sans text-sm text-espresso">
          {error}
        </p>
      )}
      {saved && (
        <p className="border border-bronze bg-blush/40 px-4 py-3 font-sans text-sm text-espresso">
          Saved. Redirecting…
        </p>
      )}

      <div className="flex flex-col gap-4">
        <Field label="Name">
          <input
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Slug">
          <input
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            className={inputClass}
          />
        </Field>

        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={inputClass}
          />
        </Field>

        <Field label="Lace Type">
          <input
            value={laceType}
            onChange={(e) => setLaceType(e.target.value)}
            className={inputClass}
          />
        </Field>

        <div className="flex flex-col gap-2">
          <span className="font-sans text-xs uppercase tracking-[0.15em] text-bronze">
            Images
          </span>
          <ImageUploader
            images={images}
            onChange={handleImagesChange}
            uploadingKeys={uploadingKeys}
          />
        </div>

        <label className="flex items-center gap-2 font-sans text-sm text-charcoal">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          Active (visible in the shop)
        </label>

        <label className="flex items-center gap-2 font-sans text-sm text-charcoal">
          <input
            type="checkbox"
            checked={isBestSeller}
            onChange={(e) => setIsBestSeller(e.target.checked)}
          />
          Mark as Best Seller
        </label>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl text-espresso">
            Sizes &amp; Pricing
          </h2>
          <button
            type="button"
            onClick={addVariantRow}
            className="font-sans text-sm text-bronze underline underline-offset-4"
          >
            + Add size
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {variants.map((row) => {
            const colorsOpen = expandedVariantColors.has(row.key);
            return (
              <div key={row.key} className="flex flex-col gap-3 border border-blush p-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-6 sm:items-end">
                  <Field label="Size Label">
                    <input
                      value={row.size_label}
                      onChange={(e) =>
                        updateVariant(row.key, "size_label", e.target.value)
                      }
                      placeholder="4x4"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Price (₦)">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.price}
                      onChange={(e) =>
                        updateVariant(row.key, "price", e.target.value)
                      }
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Compare-at Price (was)">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.compareAtPrice}
                      onChange={(e) =>
                        updateVariant(row.key, "compareAtPrice", e.target.value)
                      }
                      placeholder="Optional"
                      className={inputClass}
                    />
                    <span className="font-sans text-[11px] text-charcoal/50">
                      Leave blank if not on sale.
                    </span>
                  </Field>
                  <Field label="Stock">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={row.stock_quantity}
                      onChange={(e) =>
                        updateVariant(row.key, "stock_quantity", e.target.value)
                      }
                      className={inputClass}
                    />
                  </Field>
                  <Field label="SKU">
                    <input
                      value={row.sku}
                      onChange={(e) =>
                        updateVariant(row.key, "sku", e.target.value)
                      }
                      className={inputClass}
                    />
                  </Field>
                  <button
                    type="button"
                    onClick={() => removeVariantRow(row.key)}
                    disabled={variants.length === 1}
                    className="font-sans text-sm text-bronze underline underline-offset-4 disabled:cursor-not-allowed disabled:text-charcoal/30 disabled:no-underline"
                  >
                    Remove
                  </button>
                </div>

                <div className="border-t border-blush/60 pt-3">
                  <button
                    type="button"
                    onClick={() => toggleColorsExpanded(row.key)}
                    className="font-sans text-sm text-bronze underline underline-offset-4"
                  >
                    Colors{row.colors.length > 0 ? ` (${row.colors.length})` : ""}{" "}
                    {colorsOpen ? "▲" : "▼"}
                  </button>

                  {colorsOpen && (
                    <div className="mt-3 flex flex-col gap-2">
                      {row.colors.length === 0 && (
                        <p className="font-sans text-xs text-charcoal/50">
                          No colors added — this size will use its own stock
                          count above.
                        </p>
                      )}
                      {row.colors.map((color) => (
                        <div
                          key={color.key}
                          className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:items-end"
                        >
                          <Field label="Color Name">
                            <input
                              value={color.color_name}
                              onChange={(e) =>
                                updateColor(
                                  row.key,
                                  color.key,
                                  "color_name",
                                  e.target.value,
                                )
                              }
                              placeholder="Transparent"
                              className={inputClass}
                            />
                          </Field>
                          <Field label="Stock">
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={color.stock_quantity}
                              onChange={(e) =>
                                updateColor(
                                  row.key,
                                  color.key,
                                  "stock_quantity",
                                  e.target.value,
                                )
                              }
                              className={inputClass}
                            />
                          </Field>
                          <button
                            type="button"
                            onClick={() => removeColorRow(row.key, color.key)}
                            className="font-sans text-sm text-bronze underline underline-offset-4"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addColorRow(row.key)}
                        className="self-start font-sans text-sm text-bronze underline underline-offset-4"
                      >
                        + Add color
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <RepeatableTextList
        label="Why Choose This Lace"
        values={whyChoose}
        onChange={setWhyChoose}
        placeholder="Ultra soft, breathable lace"
      />

      <RepeatableTextList
        label="Why Not Choose This Lace"
        values={whyNotChoose}
        onChange={setWhyNotChoose}
        placeholder="Not ideal for oily scalps"
      />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl text-espresso">
            Recommended Alternatives
          </h2>
          <button
            type="button"
            onClick={addRecommendationRow}
            className="font-sans text-sm text-bronze underline underline-offset-4"
          >
            + Add recommendation
          </button>
        </div>

        {recommendations.length === 0 && (
          <p className="font-sans text-xs text-charcoal/50">
            No alternatives suggested yet.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {recommendations.map((row) => (
            <div
              key={row.key}
              className="grid grid-cols-1 gap-3 border border-blush p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
            >
              <Field label="Recommended Product">
                <select
                  required
                  value={row.recommended_product_id}
                  onChange={(e) =>
                    updateRecommendation(
                      row.key,
                      "recommended_product_id",
                      e.target.value,
                    )
                  }
                  className={inputClass}
                >
                  <option value="" disabled>
                    Select a product…
                  </option>
                  {productOptions
                    .filter((option) => option.id !== product?.id)
                    .map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                </select>
              </Field>
              <Field label="Reason Label">
                <input
                  value={row.reason_label}
                  onChange={(e) =>
                    updateRecommendation(row.key, "reason_label", e.target.value)
                  }
                  placeholder="If you want ultra soft + invisible melt"
                  className={inputClass}
                />
              </Field>
              <button
                type="button"
                onClick={() => removeRecommendationRow(row.key)}
                className="font-sans text-sm text-bronze underline underline-offset-4"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-espresso px-6 py-3 font-sans text-sm uppercase tracking-[0.2em] text-ivory disabled:opacity-50"
        >
          {saving
            ? uploadingKeys.size > 0
              ? "Uploading images…"
              : "Saving…"
            : isEditing
              ? "Save Changes"
              : "Create Product"}
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="font-sans text-sm text-bronze underline underline-offset-4 disabled:opacity-50"
          >
            Delete Product
          </button>
        )}
      </div>
    </form>
  );
}
