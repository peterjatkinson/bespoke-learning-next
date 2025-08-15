"use client";

import { useState } from "react";
import Image from "next/image";

export default function ThumbImage({
  src,
  alt,
  priority = false,
  className = "",
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {/* skeleton */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-200" aria-hidden />
      )}

      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        className="object-cover"
        unoptimized
        priority={priority}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
