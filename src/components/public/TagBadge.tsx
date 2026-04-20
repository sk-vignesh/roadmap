interface TagBadgeProps {
  name: string
  color: string
  className?: string
}

export function TagBadge({ name, color, className = '' }: TagBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-medium ${className}`}
      style={{ backgroundColor: `${color}22`, color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full flex-none"
        style={{ backgroundColor: color }}
      />
      {name}
    </span>
  )
}
