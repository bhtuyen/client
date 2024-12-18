import Image from 'next/image';

import type { StaticImport } from 'next/dist/shared/lib/get-img-props';
import type { ImageProps } from 'next/image';

export default function TImage({
  width,
  height,
  src,
  alt,
  fill,
  ...rest
}: Omit<ImageProps, 'src'> & {
  src: string | undefined | StaticImport;
}) {
  return (
    <Image
      width={fill ? undefined : (width ?? 100)}
      height={fill ? undefined : (height ?? 100)}
      src={src ?? '/60000155_kem_sua_chua_1.jpg'}
      alt={alt}
      fill={fill}
      {...rest}
      loading='lazy'
      placeholder='blur'
      blurDataURL='/restaurant.jpg'
    />
  );
}
