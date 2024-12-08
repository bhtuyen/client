import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image, { ImageProps } from 'next/image';

export default function TImage({
  width,
  height,
  src,
  alt,
  ...rest
}: Omit<ImageProps, 'src'> & {
  src: string | undefined | StaticImport;
}) {
  return (
    <Image
      width={width}
      height={height}
      src={src ?? '/60000155_kem_sua_chua_1.jpg'}
      alt={alt}
      {...rest}
      loading='lazy'
      placeholder='blur'
      blurDataURL='/restaurant.jpg'
    />
  );
}
