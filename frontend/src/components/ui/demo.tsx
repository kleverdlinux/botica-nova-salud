"use client"

import HalftoneWordmarkFooter from "@/components/ui/halftone-wordmark-footer"

export default function Demo() {
  return (
    <div className="w-full">
      <HalftoneWordmarkFooter
        wordmark="nova salud"
        label="BOTICA NOVA SALUD"
        meta="©2026 · Av. Principal 1248, Lima · Q.F. Regente Colegiada CQFP"
        preset="mono"
        height="100vh"
      />
    </div>
  )
}
