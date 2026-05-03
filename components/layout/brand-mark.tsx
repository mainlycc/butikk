import Link from "next/link"
import { BRAND_LOGO_PATH } from "@/lib/brand"
import { cn } from "@/lib/utils"

type BrandMarkProps = {
  className?: string
  imgClassName?: string
  /** Domyślnie link na stronę główną; `null` — tylko obrazek bez linku. */
  href?: string | null
}

export function BrandMark({ className, imgClassName, href = "/" }: BrandMarkProps) {
  const img = (
    <img
      src={BRAND_LOGO_PATH}
      alt="QualiBase"
      width={2537}
      height={615}
      className={cn(
        "h-8 w-auto max-w-[min(220px,70vw)] object-contain object-left",
        imgClassName
      )}
    />
  )

  if (href != null) {
    return (
      <Link
        href={href}
        className={cn("inline-flex items-center justify-start shrink-0", className)}
      >
        {img}
      </Link>
    )
  }

  return <span className={cn("inline-flex items-center", className)}>{img}</span>
}
