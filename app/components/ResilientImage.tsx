'use client';

import Image, { type ImageProps } from 'next/image';
import { useEffect, useState } from 'react';

const OPTIMIZABLE_HOSTS = new Set([
  'api.raota.net',
  'images.raota.net',
  'cdn.raota.net',
  's3.ap-northeast-2.amazonaws.com',
  'images.unsplash.com',
  'raota-storage.s3.amazonaws.com',
  'objectstorage.ap-chuncheon-1.oraclecloud.com',
  'k.kakaocdn.net',
  'lh3.googleusercontent.com',
]);

const canUseNextImage = (src: string) => {
  if (src.startsWith('/')) return true;
  if (src.startsWith('blob:') || src.startsWith('data:')) return false;

  try {
    const hostname = new URL(src).hostname;
    return (
      OPTIMIZABLE_HOSTS.has(hostname)
      || hostname.endsWith('.compat.objectstorage.ap-chuncheon-1.oraclecloud.com')
    );
  } catch {
    return false;
  }
};

type ResilientImageProps = Omit<ImageProps, 'src'> & {
  src: string;
};

export default function ResilientImage({
  src,
  alt,
  onError,
  ...props
}: ResilientImageProps) {
  const [useOriginal, setUseOriginal] = useState(false);

  useEffect(() => {
    setUseOriginal(false);
  }, [src]);

  if (canUseNextImage(src) && !useOriginal) {
    return (
      <Image
        {...props}
        src={src}
        alt={alt}
        onError={(event) => {
          setUseOriginal(true);
          onError?.(event);
        }}
      />
    );
  }

  const {
    fill,
    priority,
    quality: _quality,
    loader: _loader,
    placeholder: _placeholder,
    blurDataURL: _blurDataURL,
    unoptimized: _unoptimized,
    overrideSrc: _overrideSrc,
    onLoadingComplete: _onLoadingComplete,
    sizes: _sizes,
    style,
    width,
    height,
    loading,
    fetchPriority,
    ...imageProps
  } = props;

  return (
    <img
      {...imageProps}
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      loading={priority ? 'eager' : loading ?? 'lazy'}
      fetchPriority={fetchPriority ?? (priority ? 'high' : undefined)}
      decoding="async"
      style={fill
        ? { position: 'absolute', inset: 0, width: '100%', height: '100%', ...style }
        : style}
      onError={onError}
    />
  );
}
