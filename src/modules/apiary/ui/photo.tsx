import Image from "next/image";

// Blob hosts are allowed in next.config.ts (images.remotePatterns).
export function Photo({ url, alt }: { url: string | null; alt: string }) {
  if (!url) return null;
  return <Image src={url} alt={alt} width={384} height={256} className="h-48 w-full rounded-md object-cover" />;
}
