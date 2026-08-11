"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import MediaUploader, { type MediaItem } from "@/components/admin/MediaUploader";
import { friendlyAdminErrorMessage } from "@/lib/adminErrors";
import { getShowcaseMediaStoragePath } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";
import type { AdminShowcaseItem, ShowcaseMediaType } from "@/lib/showcase";

const inputClass =
  "rounded-md border border-charcoal/20 bg-ivory px-3 py-2 font-sans text-sm text-charcoal focus:border-espresso focus:outline-none";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 font-sans text-sm text-charcoal">
      <span className="text-xs uppercase tracking-[0.15em] text-bronze">{label}</span>
      {children}
    </label>
  );
}

// Monoline glyph in the same hand-drawn convention as TrustBadges/OffersTeaser
// — a reliable, cross-browser stand-in for a video thumbnail rather than
// relying on a <video> element to paint its first frame in a small list cell.
function VideoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
      <rect x="3" y="6" width="13" height="12" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 10l5-3v10l-5-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const SHOWCASE_SELECT =
  "id, media_url, media_type, handle_text, follower_text, caption_text, product_id, display_order, active, created_at, products(name)";

function mapRow(row: {
  id: string;
  media_url: string;
  media_type: string;
  handle_text: string | null;
  follower_text: string | null;
  caption_text: string | null;
  product_id: string | null;
  display_order: number;
  active: boolean;
  created_at: string;
  products: { name: string } | { name: string }[] | null;
}): AdminShowcaseItem {
  const product = Array.isArray(row.products) ? row.products[0] : row.products;
  return {
    id: row.id,
    mediaUrl: row.media_url,
    mediaType: row.media_type as ShowcaseMediaType,
    handleText: row.handle_text,
    followerText: row.follower_text,
    captionText: row.caption_text,
    productId: row.product_id,
    productName: product?.name ?? null,
    displayOrder: row.display_order,
    active: row.active,
    createdAt: row.created_at,
  };
}

type ProductOption = { id: string; name: string };

type FormState = {
  id?: string;
  media: MediaItem | null;
  removedMediaUrl: string | null;
  handleText: string;
  followerText: string;
  captionText: string;
  productId: string;
  displayOrder: string;
  active: boolean;
};

function emptyForm(): FormState {
  return {
    media: null,
    removedMediaUrl: null,
    handleText: "",
    followerText: "",
    captionText: "",
    productId: "",
    displayOrder: "0",
    active: true,
  };
}

function toFormState(item: AdminShowcaseItem): FormState {
  return {
    id: item.id,
    media: { kind: "existing", url: item.mediaUrl, mediaType: item.mediaType },
    removedMediaUrl: null,
    handleText: item.handleText ?? "",
    followerText: item.followerText ?? "",
    captionText: item.captionText ?? "",
    productId: item.productId ?? "",
    displayOrder: String(item.displayOrder),
    active: item.active,
  };
}

export default function ShowcaseManager({
  initialItems,
  productOptions,
}: {
  initialItems: AdminShowcaseItem[];
  productOptions: ProductOption[];
}) {
  const supabase = createClient();

  const [items, setItems] = useState<AdminShowcaseItem[]>(initialItems);
  const [formState, setFormState] = useState<FormState | null>(null);
  const [folderId] = useState(() => crypto.randomUUID());
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startAdd() {
    setError(null);
    setFormState(emptyForm());
  }

  function startEdit(item: AdminShowcaseItem) {
    setError(null);
    setFormState(toFormState(item));
  }

  function cancelForm() {
    setFormState(null);
    setError(null);
  }

  function handleMediaChange(next: MediaItem | null) {
    setFormState((f) => {
      if (!f) return f;
      const droppedExisting =
        f.media?.kind === "existing" &&
        (!next || next.kind !== "existing" || next.url !== f.media.url)
          ? f.media.url
          : f.removedMediaUrl;
      return { ...f, media: next, removedMediaUrl: droppedExisting };
    });
  }

  async function uploadMedia(): Promise<{ url: string; mediaType: ShowcaseMediaType } | null> {
    const media = formState?.media;
    if (!media) return null;
    if (media.kind === "existing") return { url: media.url, mediaType: media.mediaType };

    setUploading(true);
    try {
      const ext =
        media.file.name.split(".").pop()?.toLowerCase() ||
        (media.mediaType === "video" ? "mp4" : "jpg");
      const path = `showcase/${folderId}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("customer-showcase")
        .upload(path, media.file, { cacheControl: "3600", upsert: false });
      if (uploadError) {
        throw new Error(`Failed to upload ${media.file.name}: ${uploadError.message}`);
      }
      const {
        data: { publicUrl },
      } = supabase.storage.from("customer-showcase").getPublicUrl(path);
      return { url: publicUrl, mediaType: media.mediaType };
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!formState) return;

    if (!formState.media) {
      setError("Upload a photo or video.");
      return;
    }

    setSaving(true);
    setError(null);

    let mediaResult: { url: string; mediaType: ShowcaseMediaType } | null;
    try {
      mediaResult = await uploadMedia();
    } catch (uploadErr) {
      setError(uploadErr instanceof Error ? uploadErr.message : "Could not upload media.");
      setSaving(false);
      return;
    }
    if (!mediaResult) {
      setError("Upload a photo or video.");
      setSaving(false);
      return;
    }

    const payload = {
      media_url: mediaResult.url,
      media_type: mediaResult.mediaType,
      handle_text: formState.handleText.trim() || null,
      follower_text: formState.followerText.trim() || null,
      caption_text: formState.captionText.trim() || null,
      product_id: formState.productId || null,
      display_order: Number(formState.displayOrder) || 0,
      active: formState.active,
    };

    if (formState.id) {
      const { data, error: updateError } = await supabase
        .from("customer_showcase")
        .update(payload)
        .eq("id", formState.id)
        .select(SHOWCASE_SELECT)
        .single();

      if (updateError || !data) {
        setError(friendlyAdminErrorMessage(updateError, "Could not save changes."));
        setSaving(false);
        return;
      }

      const mapped = mapRow(data);
      setItems((current) => current.map((it) => (it.id === mapped.id ? mapped : it)));
    } else {
      const { data, error: insertError } = await supabase
        .from("customer_showcase")
        .insert(payload)
        .select(SHOWCASE_SELECT)
        .single();

      if (insertError || !data) {
        setError(friendlyAdminErrorMessage(insertError, "Could not add item."));
        setSaving(false);
        return;
      }

      setItems((current) => [mapRow(data), ...current]);
    }

    if (formState.removedMediaUrl) {
      const path = getShowcaseMediaStoragePath(formState.removedMediaUrl);
      if (path) {
        await supabase.storage.from("customer-showcase").remove([path]).catch(() => {});
      }
    }

    setSaving(false);
    setFormState(null);
  }

  async function handleDelete(item: AdminShowcaseItem) {
    const confirmed = window.confirm(
      `Delete this showcase item${item.handleText ? ` from ${item.handleText}` : ""}? This can't be undone.`,
    );
    if (!confirmed) return;

    const { error: deleteError } = await supabase
      .from("customer_showcase")
      .delete()
      .eq("id", item.id);

    if (deleteError) {
      setError(friendlyAdminErrorMessage(deleteError, "Could not delete item."));
      return;
    }

    setItems((current) => current.filter((it) => it.id !== item.id));

    const path = getShowcaseMediaStoragePath(item.mediaUrl);
    if (path) {
      await supabase.storage.from("customer-showcase").remove([path]).catch(() => {});
    }
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
          Photo/video testimonial cards for the homepage&apos;s Customer Showcase
          row.
        </p>
        <button
          type="button"
          onClick={startAdd}
          className="shrink-0 rounded-md bg-espresso px-5 py-2.5 font-sans text-sm uppercase tracking-[0.2em] text-ivory"
        >
          + Add Showcase Item
        </button>
      </div>

      {formState && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-md border border-blush p-6"
        >
          <h3 className="font-heading text-lg text-espresso">
            {formState.id ? "Edit Showcase Item" : "New Showcase Item"}
          </h3>

          <Field label="Media (photo or video)">
            <MediaUploader
              item={formState.media}
              onChange={handleMediaChange}
              uploading={uploading}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Handle (optional)">
              <input
                value={formState.handleText}
                onChange={(e) =>
                  setFormState((f) => f && { ...f, handleText: e.target.value })
                }
                placeholder="@customername"
                className={inputClass}
              />
            </Field>
            <Field label="Follower Text (optional)">
              <input
                value={formState.followerText}
                onChange={(e) =>
                  setFormState((f) => f && { ...f, followerText: e.target.value })
                }
                placeholder="1.2K followers"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Caption (optional)">
            <textarea
              value={formState.captionText}
              onChange={(e) =>
                setFormState((f) => f && { ...f, captionText: e.target.value })
              }
              rows={2}
              placeholder="This one has everything"
              className={inputClass}
            />
          </Field>

          <Field label="Tagged Product (optional)">
            <select
              value={formState.productId}
              onChange={(e) =>
                setFormState((f) => f && { ...f, productId: e.target.value })
              }
              className={inputClass}
            >
              <option value="">None</option>
              {productOptions.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Display Order">
              <input
                type="number"
                value={formState.displayOrder}
                onChange={(e) =>
                  setFormState((f) => f && { ...f, displayOrder: e.target.value })
                }
                className={inputClass}
              />
            </Field>
            <label className="flex items-center gap-2 self-end pb-2 font-sans text-sm text-charcoal">
              <input
                type="checkbox"
                checked={formState.active}
                onChange={(e) =>
                  setFormState((f) => f && { ...f, active: e.target.checked })
                }
              />
              Active
            </label>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving || uploading}
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

      {items.length === 0 ? (
        <p className="font-sans text-sm text-charcoal/70">
          No showcase items yet. Add your first photo or video testimonial.
        </p>
      ) : (
        <div className="overflow-x-auto border border-blush">
          <table className="w-full border-collapse text-left font-sans text-sm">
            <thead>
              <tr className="border-b border-blush bg-blush/30 text-xs uppercase tracking-[0.1em] text-bronze">
                <th className="px-4 py-3 font-medium">Media</th>
                <th className="px-4 py-3 font-medium">Handle</th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-blush/60 last:border-0 align-top">
                  <td className="px-4 py-3">
                    {item.mediaType === "video" ? (
                      <span className="flex h-12 w-12 items-center justify-center rounded-md border border-blush bg-blush/30 text-bronze">
                        <VideoIcon />
                      </span>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.mediaUrl}
                        alt=""
                        className="h-12 w-12 rounded-md border border-blush object-cover"
                      />
                    )}
                  </td>
                  <td className="px-4 py-3 text-charcoal">{item.handleText || "—"}</td>
                  <td className="px-4 py-3 text-charcoal/70">{item.productName ?? "—"}</td>
                  <td className="px-4 py-3 text-charcoal/70">{item.displayOrder}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 font-sans text-xs uppercase tracking-wide ${
                        item.active
                          ? "bg-espresso text-ivory"
                          : "bg-charcoal/10 text-charcoal/60"
                      }`}
                    >
                      {item.active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="font-sans text-xs uppercase tracking-[0.1em] text-bronze underline underline-offset-4"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="font-sans text-xs uppercase tracking-[0.1em] text-charcoal/50 underline underline-offset-4 hover:text-charcoal"
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
