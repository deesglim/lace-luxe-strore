const PUBLIC_URL_MARKER = "/storage/v1/object/public/product-images/";

// Storage's `remove()` wants the object's path within the bucket, not its
// public URL, so this reverses getPublicUrl() for cleanup after a delete.
export function getProductImageStoragePath(publicUrl: string): string | null {
  const index = publicUrl.indexOf(PUBLIC_URL_MARKER);
  if (index === -1) return null;
  return publicUrl.slice(index + PUBLIC_URL_MARKER.length);
}

const SHOWCASE_PUBLIC_URL_MARKER = "/storage/v1/object/public/customer-showcase/";

export function getShowcaseMediaStoragePath(publicUrl: string): string | null {
  const index = publicUrl.indexOf(SHOWCASE_PUBLIC_URL_MARKER);
  if (index === -1) return null;
  return publicUrl.slice(index + SHOWCASE_PUBLIC_URL_MARKER.length);
}
