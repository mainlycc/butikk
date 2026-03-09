"use client"

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

interface ExpandableTagsProps {
  label: string
  tags: Array<{ text: string; href: string }>
  variant?: "outline" | "secondary"
  initialCount?: number
}

export default function ExpandableTags({
  label,
  tags,
  variant = "outline",
  initialCount = 3,
}: ExpandableTagsProps) {
  const [expanded, setExpanded] = useState(false)

  if (tags.length === 0) return null

  const visible = expanded ? tags : tags.slice(0, initialCount)
  const hiddenCount = tags.length - initialCount

  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>
      <div className="flex flex-wrap items-center gap-2">
        {visible.map((tag) => (
          <Link key={tag.href} href={tag.href}>
            <Badge
              variant={variant}
              className="px-3 py-1.5 text-sm hover:bg-accent transition-colors cursor-pointer"
            >
              {tag.text}
            </Badge>
          </Link>
        ))}
        {hiddenCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground h-auto py-1.5 px-2"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                Zwiń
                <ChevronUp className="w-3 h-3 ml-1" />
              </>
            ) : (
              <>
                +{hiddenCount} więcej
                <ChevronDown className="w-3 h-3 ml-1" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
