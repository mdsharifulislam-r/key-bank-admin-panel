interface BrandMarkProps {
  compact?: boolean
  className?: string
}

export function BrandMark({ compact = false, className = '' }: BrandMarkProps) {
  if (compact) {
    return (
      <div className={`h-11 w-11 overflow-hidden rounded-full bg-black ${className}`}>
        <img
          src="/brand/key-bank-logo.png"
          alt="Keybank"
          className="h-[180%] w-full object-cover object-top"
        />
      </div>
    )
  }

  return (
    <img
      src="/brand/key-bank-logo.png"
      alt="Keybank MENA"
      className={`w-full object-contain ${className}`}
    />
  )
}
