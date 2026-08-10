"use client";

import { useState, type ReactNode } from "react";
import ImageUploader, { type ImageItem } from "@/components/admin/ImageUploader";
import { getProductImageStoragePath } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";
import type { StoreSettings } from "@/types";

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

export default function HomepageSettingsManager({
  initialSettings,
}: {
  initialSettings: StoreSettings | null;
}) {
  const supabase = createClient();

  const [heading, setHeading] = useState(
    initialSettings?.hero_heading ?? "Luxury Lace For Flawless Installs",
  );
  const [subheading, setSubheading] = useState(
    initialSettings?.hero_subheading ??
      "Premium HD Lace and Swiss Lace crafted for luxury wigmakers, hairstylists, and beauty brands.",
  );
  const [image, setImage] = useState<ImageItem[]>(
    initialSettings?.hero_image_url
      ? [{ key: initialSettings.hero_image_url, kind: "existing", url: initialSettings.hero_image_url }]
      : [],
  );
  const [removedImageUrl, setRemovedImageUrl] = useState<string | null>(null);
  const [settingsId, setSettingsId] = useState<string | null>(
    initialSettings?.id ?? null,
  );
  const [folderId] = useState(() => crypto.randomUUID());
  const [uploadingKeys, setUploadingKeys] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleImageChange(next: ImageItem[]) {
    // Single-image mode: reuses the multi-image uploader component without
    // needing a variant of it — dropping a new file just replaces the
    // previous one, same trick as the bundle offer image field.
    const capped = next.slice(-1);
    const droppedExisting = image.find(
      (item) => item.kind === "existing" && !capped.some((n) => n.key === item.key),
    );
    if (droppedExisting?.kind === "existing") {
      setRemovedImageUrl(droppedExisting.url);
    }
    setImage(capped);
  }

  async function uploadImage(): Promise<string | null> {
    const item = image[0];
    if (!item) return null;
    if (item.kind === "existing") return item.url;

    setUploadingKeys((keys) => new Set(keys).add(item.key));
    try {
      const ext = item.file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `homepage/${folderId}/${crypto.randomUUID()}.${ext}`;
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

  async function handleSave() {
    setSaving(true);
    setSaved(false);
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
      hero_image_url: imageUrl,
      hero_heading: heading.trim() || null,
      hero_subheading: subheading.trim() || null,
    };

    if (settingsId) {
      const { error: updateError } = await supabase
        .from("store_settings")
        .update(payload)
        .eq("id", settingsId);

      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }
    } else {
      const { data, error: insertError } = await supabase
        .from("store_settings")
        .insert(payload)
        .select("id")
        .single();

      if (insertError || !data) {
        setError(insertError?.message ?? "Could not save settings.");
        setSaving(false);
        return;
      }
      setSettingsId(data.id);
    }

    if (removedImageUrl) {
      const path = getProductImageStoragePath(removedImageUrl);
      if (path) {
        await supabase.storage.from("product-images").remove([path]).catch(() => {});
      }
      setRemovedImageUrl(null);
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex max-w-xl flex-col gap-6">
      {error && (
        <p className="rounded-md border border-bronze bg-blush/40 px-4 py-3 font-sans text-sm text-espresso">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-4 rounded-md border border-blush p-6">
        <h2 className="font-heading text-xl text-espresso">Hero Section</h2>

        <Field label="Hero Image (optional — falls back to a plain style if unset)">
          <ImageUploader
            images={image}
            onChange={handleImageChange}
            uploadingKeys={uploadingKeys}
          />
        </Field>

        <Field label="Hero Heading">
          <input
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Hero Subheading">
          <textarea
            value={subheading}
            onChange={(e) => setSubheading(e.target.value)}
            rows={2}
            className={inputClass}
          />
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
