'use client';

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

interface Props extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
  // Render at natural image ratio (w-full, h-auto). Parent must NOT have a
  // fixed height — the image drives the container height itself.
  naturalSize?: boolean;
}

export function ImageWithFallback({
  src,
  alt,
  className,
  fallbackSrc = ERROR_IMG_SRC,
  quality = 90,
  width,
  height,
  fill,
  naturalSize,
  ...rest
}: Props) {
  const validSrc = (s: typeof src) => (s && String(s).trim() !== '' ? s : fallbackSrc);

  const [imgSrc, setImgSrc] = useState(() => validSrc(src));

  useEffect(() => {
    setImgSrc(validSrc(src));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const onError = () => setImgSrc(fallbackSrc);

  // Natural-size mode: width=0/height=0 + sizes is the official Next.js pattern
  // for displaying images at their intrinsic aspect ratio responsively.
  if (naturalSize) {
    return (
      <Image
        src={imgSrc}
        alt={alt || 'Product image'}
        className={className}
        quality={quality}
        width={0}
        height={0}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        style={{ width: '100%', height: 'auto', display: 'block' }}
        onError={onError}
        {...rest}
      />
    );
  }

  const imageProps = {
    src: imgSrc,
    alt: alt || 'Product image',
    className,
    quality,
    onError,
    ...rest,
  };

  return (
    <Image
      {...imageProps}
      fill={fill}
      width={!fill ? (width ?? 500) : undefined}
      height={!fill ? (height ?? 500) : undefined}
    />
  );
}
