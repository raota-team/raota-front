"use client";

import { useEffect, useState } from "react";
import type { ImageProps } from "next/image";
import { RAMEN_LOG_FALLBACK_IMAGE, isRamenLogFallbackImage } from "@/lib/constants/images";
import ResilientImage from "./ResilientImage";

type RamenLogImageProps = Omit<ImageProps, "src"> & {
  src?: string | null;
};

export default function RamenLogImage({
  src,
  className = "",
  onError,
  ...props
}: RamenLogImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const showFallback = hasError || isRamenLogFallbackImage(src);
  const resolvedSrc = showFallback ? RAMEN_LOG_FALLBACK_IMAGE : src!;
  const fallbackClassName = className.replace(/\bobject-cover\b/g, "").trim();

  return (
    <ResilientImage
      {...props}
      src={resolvedSrc}
      className={
        showFallback
          ? `bg-[#f2f2f2] object-contain p-[18%] ${fallbackClassName}`
          : className
      }
      onError={(event) => {
        if (!showFallback) setHasError(true);
        onError?.(event);
      }}
    />
  );
}
