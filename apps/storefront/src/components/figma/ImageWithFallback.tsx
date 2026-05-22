'use client';

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

interface Props extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
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
  ...rest
}: Props) {
  const validSrc = (s: typeof src) => (s && String(s).trim() !== '' ? s : fallbackSrc);

  const [imgSrc, setImgSrc] = useState(() => validSrc(src));

  useEffect(() => {
    setImgSrc(validSrc(src));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const imageProps = {
    src: imgSrc,
    alt: alt || 'Product image',
    className,
    quality,
    onError: () => setImgSrc(fallbackSrc),
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
