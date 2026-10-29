const IMAGE_EXT = /\.(avif|bmp|gif|jpe?g|png|svg|webp)(\?.*)?$/i
const fileUrls = new WeakMap<File, string>()

export function isImageUrl(url: string): boolean {
  return IMAGE_EXT.test(url)
}

export function previewUrl(file: File): string {
  const existing = fileUrls.get(file)
  if (existing) return existing
  const url = URL.createObjectURL(file)
  fileUrls.set(file, url)
  return url
}

export function releasePreview(file: File): void {
  const url = fileUrls.get(file)
  if (!url) return
  URL.revokeObjectURL(url)
  fileUrls.delete(file)
}
