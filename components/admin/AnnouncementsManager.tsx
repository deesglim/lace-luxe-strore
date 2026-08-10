"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AdminAnnouncement } from "@/lib/announcements";

const inputClass =
  "rounded-md border border-charcoal/20 bg-ivory px-3 py-2 font-sans text-sm text-charcoal focus:border-espresso focus:outline-none";

function mapRow(row: {
  id: string;
  text: string;
  active: boolean;
  display_order: number;
  created_at: string;
}): AdminAnnouncement {
  return {
    id: row.id,
    text: row.text,
    active: row.active,
    displayOrder: row.display_order,
    createdAt: row.created_at,
  };
}

type FormState = {
  id?: string;
  text: string;
  active: boolean;
};

function emptyForm(): FormState {
  return { text: "", active: true };
}

function toFormState(item: AdminAnnouncement): FormState {
  return { id: item.id, text: item.text, active: item.active };
}

export default function AnnouncementsManager({
  initialItems,
}: {
  initialItems: AdminAnnouncement[];
}) {
  const supabase = createClient();

  const [items, setItems] = useState<AdminAnnouncement[]>(
    [...initialItems].sort((a, b) => a.displayOrder - b.displayOrder),
  );
  const [formState, setFormState] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startAdd() {
    setError(null);
    setFormState(emptyForm());
  }

  function startEdit(item: AdminAnnouncement) {
    setError(null);
    setFormState(toFormState(item));
  }

  function cancelForm() {
    setFormState(null);
    setError(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!formState) return;

    if (!formState.text.trim()) {
      setError("Announcement text can't be empty.");
      return;
    }

    setSaving(true);
    setError(null);

    if (formState.id) {
      const payload = { text: formState.text.trim(), active: formState.active };
      const { data, error: updateError } = await supabase
        .from("site_announcements")
        .update(payload)
        .eq("id", formState.id)
        .select("id, text, active, display_order, created_at")
        .single();

      if (updateError || !data) {
        setError(updateError?.message ?? "Could not save changes.");
        setSaving(false);
        return;
      }

      const mapped = mapRow(data);
      setItems((current) =>
        current.map((it) => (it.id === mapped.id ? mapped : it)),
      );
    } else {
      // New items go to the back of the line — one more than the current
      // highest display_order, so they don't jump ahead of existing ones.
      const nextOrder =
        items.length === 0 ? 0 : Math.max(...items.map((it) => it.displayOrder)) + 1;
      const payload = {
        text: formState.text.trim(),
        active: formState.active,
        display_order: nextOrder,
      };
      const { data, error: insertError } = await supabase
        .from("site_announcements")
        .insert(payload)
        .select("id, text, active, display_order, created_at")
        .single();

      if (insertError || !data) {
        setError(insertError?.message ?? "Could not add announcement.");
        setSaving(false);
        return;
      }

      setItems((current) => [...current, mapRow(data)]);
    }

    setSaving(false);
    setFormState(null);
  }

  async function handleDelete(item: AdminAnnouncement) {
    const confirmed = window.confirm(
      `Delete this announcement? "${item.text}"`,
    );
    if (!confirmed) return;

    const { error: deleteError } = await supabase
      .from("site_announcements")
      .delete()
      .eq("id", item.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setItems((current) => current.filter((it) => it.id !== item.id));
  }

  async function handleMove(item: AdminAnnouncement, direction: "up" | "down") {
    const index = items.findIndex((it) => it.id === item.id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= items.length) return;

    const other = items[swapIndex];
    setError(null);

    const [{ error: err1 }, { error: err2 }] = await Promise.all([
      supabase
        .from("site_announcements")
        .update({ display_order: other.displayOrder })
        .eq("id", item.id),
      supabase
        .from("site_announcements")
        .update({ display_order: item.displayOrder })
        .eq("id", other.id),
    ]);

    if (err1 || err2) {
      setError(err1?.message ?? err2?.message ?? "Could not reorder.");
      return;
    }

    setItems((current) => {
      const next = current.map((it) => {
        if (it.id === item.id) return { ...it, displayOrder: other.displayOrder };
        if (it.id === other.id) return { ...it, displayOrder: item.displayOrder };
        return it;
      });
      return next.sort((a, b) => a.displayOrder - b.displayOrder);
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-md border border-blush p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl text-espresso">Announcement Bar</h2>
          <p className="mt-1 font-sans text-xs text-charcoal/60">
            Shown as a slim bar above the header on every storefront page.
            Add more than one and they rotate automatically; with none
            active, the bar stays hidden.
          </p>
        </div>
        <button
          type="button"
          onClick={startAdd}
          className="shrink-0 rounded-md bg-espresso px-5 py-2.5 font-sans text-sm uppercase tracking-[0.2em] text-ivory"
        >
          + Add
        </button>
      </div>

      {error && (
        <p className="rounded-md border border-bronze bg-blush/40 px-4 py-3 font-sans text-sm text-espresso">
          {error}
        </p>
      )}

      {formState && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 border-t border-blush pt-4"
        >
          <label className="flex flex-col gap-1 font-sans text-sm text-charcoal">
            <span className="text-xs uppercase tracking-[0.15em] text-bronze">Text</span>
            <input
              value={formState.text}
              onChange={(e) =>
                setFormState((f) => f && { ...f, text: e.target.value })
              }
              placeholder="e.g. Free shipping on orders over ₦50,000"
              className={inputClass}
            />
          </label>

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

      {items.length === 0 ? (
        <p className="font-sans text-sm text-charcoal/70">No announcements yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item, index) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 border border-blush px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`inline-block shrink-0 px-2 py-0.5 font-sans text-xs uppercase tracking-wide ${
                    item.active
                      ? "bg-espresso text-ivory"
                      : "bg-charcoal/10 text-charcoal/60"
                  }`}
                >
                  {item.active ? "Active" : "Hidden"}
                </span>
                <span className="truncate font-sans text-sm text-charcoal">
                  {item.text}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleMove(item, "up")}
                  disabled={index === 0}
                  aria-label="Move up"
                  className="text-charcoal/50 transition hover:text-espresso disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(item, "down")}
                  disabled={index === items.length - 1}
                  aria-label="Move down"
                  className="text-charcoal/50 transition hover:text-espresso disabled:opacity-30"
                >
                  ↓
                </button>
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
