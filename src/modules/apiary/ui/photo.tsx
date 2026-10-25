"use client";

import Image from "next/image";
import { useState } from "react";

// Blob hosts are allowed in next.config.ts (images.remotePatterns).
// "hero" is the one large photo of a page: preloaded, and faded in once it has arrived.
export function Photo({
  url,
  alt,
  variant = "thumbnail",
}: {
  url: string | null;
  alt: string;
  variant?: "thumbnail" | "hero";
}) {
  const [loaded, setLoaded] = useState(false);
  if (!url) return null;
  if (variant === "thumbnail") {
    return <Image src={url} alt={alt} width={384} height={256} className="h-48 w-full rounded-md object-cover" />;
  }
  return (
    <Image
      src={url}
      alt={alt}
      width={384}
      height={288}
      preload
      onLoad={() => setLoaded(true)}
      data-loaded={loaded}
      className="aspect-4/3 w-full object-cover opacity-0 transition-opacity duration-700 ease-out data-[loaded=true]:opacity-100 motion-reduce:transition-none"
    />
  );
}
