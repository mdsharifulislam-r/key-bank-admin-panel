import { Image } from 'antd'
import { ImagePlus, X } from 'lucide-react'
import { useId } from 'react'
import { previewUrl, releasePreview } from '@/lib/images'
import { ImageGallery } from './ImagePreview'

interface ImageUploadProps {
  id: string
  files: File[]
  onChange: (files: File[]) => void
  existing?: Array<string | null | undefined> | null
  multiple?: boolean
}

export function ImageUpload({ id, files, onChange, existing, multiple = false }: ImageUploadProps) {
  const describedBy = useId()
  const previews = files.map((file) => ({ name: file.name, url: previewUrl(file), file }))

  const addFiles = (list: FileList | File[]) => {
    const incoming = Array.from(list).filter((file) => file.type.startsWith('image/'))
    if (incoming.length === 0) return
    onChange(multiple ? [...files, ...incoming] : incoming.slice(0, 1))
  }

  return (
    <div className="space-y-3">
      {existing && existing.some(Boolean) ? (
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">Current</p>
          <ImageGallery images={existing} alt="Current image" />
        </div>
      ) : null}
      <label
        htmlFor={id}
        className="block cursor-pointer rounded-2xl border border-dashed border-gold/60 bg-gold-soft/40 px-4 py-6 text-center transition hover:border-gold hover:bg-gold-soft"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          addFiles(event.dataTransfer.files)
        }}
      >
        <ImagePlus className="mx-auto text-gold-deep" size={22} aria-hidden />
        <p className="mt-2 text-sm font-semibold text-ink">Drop an image here, or choose a file</p>
        <p id={describedBy} className="mt-1 text-xs text-muted">
          JPG, PNG, or WebP. {multiple ? 'You can add more than one.' : 'One photo is saved with the profile.'}
        </p>
        <span className="mt-3 inline-flex rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">Choose image</span>
      </label>
      <input
        id={id}
        className="sr-only"
        type="file"
        accept="image/*"
        multiple={multiple}
        aria-describedby={describedBy}
        onChange={(event) => {
          addFiles(event.target.files ?? [])
          event.target.value = ''
        }}
      />
      {previews.length > 0 ? (
        <Image.PreviewGroup>
          <ul className="grid grid-cols-3 gap-2">
            {previews.map((preview, index) => (
              <li key={preview.url} className="image-frame relative overflow-hidden rounded-xl border border-line">
                <Image src={preview.url} alt={preview.name} width="100%" height={96} style={{ objectFit: 'cover' }} preview={{ mask: 'View' }} />
                <button
                  type="button"
                  className="absolute top-1.5 right-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white"
                  aria-label={`Remove ${preview.name}`}
                  onClick={() => {
                    releasePreview(preview.file)
                    onChange(files.filter((_, fileIndex) => fileIndex !== index))
                  }}
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        </Image.PreviewGroup>
      ) : null}
    </div>
  )
}
