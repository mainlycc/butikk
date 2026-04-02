import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface PublicFilterTagsProps {
  label: string
  tags: Array<{ text: string; href: string }>
  variant?: "outline" | "secondary"
  /** Ile tagów widać domyślnie zanim użytkownik rozwinie `<details>` */
  collapsedVisible?: number
}

export default function PublicFilterTags({
  label,
  tags,
  variant = "outline",
  collapsedVisible = 3,
}: PublicFilterTagsProps) {
  if (tags.length === 0) return null

  const initial = tags.slice(0, collapsedVisible)
  const rest = tags.slice(collapsedVisible)
  const hiddenCount = rest.length

  const badgeClass =
    "px-3 py-1.5 text-sm hover:bg-accent transition-colors no-underline inline-flex"

  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>
      <div className="flex flex-wrap items-center gap-2">
        {initial.map((tag) => (
          <a key={tag.href} href={tag.href} className="no-underline">
            <Badge variant={variant} className={badgeClass}>
              {tag.text}
            </Badge>
          </a>
        ))}
        {hiddenCount > 0 && (
          <details className="inline-flex items-center group">
            <summary
              className={cn(
                "list-none cursor-pointer text-xs text-muted-foreground py-1.5 px-2 rounded-md",
                "hover:bg-accent/50 marker:content-none [&::-webkit-details-marker]:hidden"
              )}
            >
              <span className="group-open:hidden">+{hiddenCount} więcej</span>
              <span className="hidden group-open:inline">Zwiń</span>
            </summary>
            <div className="flex flex-wrap gap-2 mt-2 w-full">
              {rest.map((tag) => (
                <a key={tag.href} href={tag.href} className="no-underline">
                  <Badge variant={variant} className={badgeClass}>
                    {tag.text}
                  </Badge>
                </a>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  )
}
