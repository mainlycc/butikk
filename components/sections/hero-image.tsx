"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface HeroImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
}

export function HeroImage({ src, alt, width, height, className }: HeroImageProps) {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn(className)}
      onError={() => setVisible(false)}
      unoptimized
    />
  )
}
