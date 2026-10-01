import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function WeddingLiveLegacyPage({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/thiep/${slug}/live-display`);
}
