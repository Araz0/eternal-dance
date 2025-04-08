import { ImgHTMLAttributes } from 'react';

type ImageProps = {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
} & ImgHTMLAttributes<HTMLImageElement>;


export default function Image({ src, alt, width, height, ...props }: ImageProps) {
    return (
        <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading="lazy"
            style={{ objectFit: 'cover' }}
            {...props}
        />
    );
}
  

  