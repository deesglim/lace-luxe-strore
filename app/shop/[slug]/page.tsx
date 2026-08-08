import PagePlaceholder from "@/components/PagePlaceholder";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PagePlaceholder title={`Product: ${slug}`} />;
}
