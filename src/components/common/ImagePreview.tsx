import { Image } from 'antd'

interface ImagePreviewProps {
  src?: string | null
  alt: string
  size?: number
  rounded?: 'md' | 'full'
  fallback?: string
}

export function ImagePreview({ src, alt, size = 40, rounded = 'md', fallback }: ImagePreviewProps) {
  const radius = rounded === 'full' ? '999px' : '12px'
  if (!src) {
    return (
      <span
        className="inline-flex shrink-0 items-center justify-center bg-canvas text-xs font-semibold text-muted"
        style={{ width: size, height: size, borderRadius: radius }}
        aria-hidden={fallback ? undefined : true}
      >
        {fallback?.slice(0, 1).toUpperCase() || '—'}
      </span>
    )
  }

  return (
    <span className="image-frame inline-flex shrink-0" onClick={(event) => event.stopPropagation()}>
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        style={{ objectFit: 'cover', borderRadius: radius }}
        preview={{ mask: 'View' }}
      />
    </span>
  )
}

export function ImageGallery({ images, alt }: { images?: Array<string | null | undefined> | null; alt: string }) {
  const urls = (images ?? []).filter((url): url is string => Boolean(url))
  if (urls.length === 0) {
    return <div className="flex h-56 items-center justify-center text-sm text-muted">No image uploaded</div>
  }

  return (
    <Image.PreviewGroup>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {urls.map((url) => (
          <span key={url} className="image-frame overflow-hidden rounded-xl border border-line">
            <Image src={url} alt={alt} width="100%" height={148} style={{ objectFit: 'cover' }} preview={{ mask: 'View' }} />
          </span>
        ))}
      </div>
    </Image.PreviewGroup>
  )
}
