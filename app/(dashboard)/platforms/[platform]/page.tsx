import { PlatformView } from "@/components/platforms/platform-view";
import { platforms } from "@/lib/data";
import { notFound } from "next/navigation";
export function generateStaticParams() {
  return platforms.map((p) => ({ platform: p.toLowerCase() }));
}
export default async function PlatformPage({
  params,
}: {
  params: Promise<{ platform: string }>;
}) {
  const { platform } = await params;
  const found = platforms.find((p) => p.toLowerCase() === platform);
  if (!found) notFound();
  return <PlatformView platform={found} />;
}
