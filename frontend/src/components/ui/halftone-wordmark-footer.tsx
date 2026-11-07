"use client"

// Halftone Wordmark Footer — a site footer whose wordmark is set enormous and
// cropped by the bottom edge, printed as a field of halftone dots. Each dot is
// sized by how much of the letter covers its cell, so the type keeps its edges
// at any scale. Move across it and the dots part around the pointer on springs,
// warming in colour as they are pushed off their place; click and a shock ring
// runs through the word. Above it sit the studio line, tracked link columns and
// a back-to-top, separated by a hairline, all over a fine print grain.
//
// One file, React only. A 2D canvas for the dots and the grain, real anchors
// for the links. Every rule in the scoped <style> is .hwf- prefixed and nothing
// is fetched: the faces come from the host page or the fallback stacks.

import * as React from "react"
import { Link } from "react-router-dom"

export interface HalftonePalette {
  /** The footer background. */
  background: string
  /** The dots at rest, and the text. */
  ink: string
  /** The colour a dot warms toward as it is pushed off its place. */
  warm: string
}

export type HalftonePreset = "light" | "mono" | "night" | "paper" | "ember" | "cobalt" | "emerald"

export interface FooterLink {
  label: string
  href?: string
  action?: 'reclamaciones' | 'services' | 'location' | 'brand'
  serviceId?: string
  tab?: 'historia' | 'mapa'
}

export interface FooterColumn {
  title: string
  links: FooterLink[]
}

export interface HalftoneWordmarkFooterProps {
  /** The giant word printed in dots. Lowercase reads best. */
  wordmark?: string
  /** Top-left studio line. */
  label?: string
  /** The muted line under it. */
  meta?: string
  /** Link columns along the top. */
  columns?: FooterColumn[]
  /** Show the back-to-top link. It scrolls the window to 0. Defaults to true. */
  backToTop?: boolean
  /** Starting colours. Defaults to "light". */
  preset?: HalftonePreset
  /** Colour overrides, merged over the preset. */
  palette?: { background?: string; ink?: string; warm?: string }
  /** Distance between dot centres, in CSS px. Defaults to 6. */
  dotGap?: number
  /** How far the pointer pushes, in CSS px. Defaults to 80. */
  radius?: number
  /** How much of the word's cap height hangs below the bottom edge, 0–0.6. Defaults to 0.2. */
  crop?: number
  /** Print grain over everything, 0–1. Defaults to 0.5. */
  grain?: number
  /** Pointer and click response. Defaults to true. */
  interactive?: boolean
  /** Face for the wordmark. Heavy grotesks print best. */
  fontFamily?: string
  /** Weight of the wordmark. Defaults to 800. */
  fontWeight?: number
  /** Face for the small type. */
  monoFamily?: string
  /** Root height. A definite length, never a percentage. Defaults to 100vh. */
  height?: string
  /** Extra root class names. */
  className?: string
}

const PRESETS: { [K in HalftonePreset]: HalftonePalette } = {
  light: { background: "#ffffff", ink: "#111827", warm: "#0d9488" },
  mono: { background: "#ffffff", ink: "#111827", warm: "#0d9488" },
  night: { background: "#0c0c0b", ink: "#e9e4da", warm: "#e9762b" },
  paper: { background: "#efebe3", ink: "#17150f", warm: "#c2361c" },
  ember: { background: "#160a06", ink: "#f2c48c", warm: "#ff5a1f" },
  cobalt: { background: "#0d1b4d", ink: "#dfe7ff", warm: "#ffcd3c" },
  emerald: { background: "#081310", ink: "#d1fae5", warm: "#10b981" },
}

const DEFAULT_COLUMNS: FooterColumn[] = [
  {
    title: "Catálogo",
    links: [
      { label: "Medicamentos & Éticos", href: "/catalogo?collection=medicamentos" },
      { label: "Salud Cardiovascular", href: "/catalogo?collection=cardiovascular" },
      { label: "Dermocosmética Especializada", href: "/catalogo?collection=dermocosmetica" },
      { label: "Cuidado Pediátrico", href: "/catalogo?collection=pediatria" },
      { label: "Bienestar & Suplementos", href: "/catalogo?collection=bienestar-suplementos" },
      { label: "Botiquín & Primeros Auxilios", href: "/catalogo?collection=botiquin" },
    ],
  },
  {
    title: "Servicios Clínicos",
    links: [
      { label: "Toma de Presión Arterial (S/ 2.00)", action: 'services', serviceId: 'presion' },
      { label: "Medición de Glucosa Capilar (S/ 5.00)", action: 'services', serviceId: 'glucosa' },
      { label: "Aplicación de Inyectables (S/ 8.00)", action: 'services', serviceId: 'inyectable' },
      { label: "Curación Menor & Tópico (S/ 12.00)", action: 'services', serviceId: 'curacion' },
      { label: "Asesoría Profesional CQFP (Gratis)", action: 'services', serviceId: 'asesoria' },
    ],
  },
  {
    title: "Contacto & Sede",
    links: [
      { label: "Nuestra Historia", action: 'brand', tab: 'historia' },
      { label: "Dónde Ubicarnos (Mapa)", action: 'location' },
      { label: "Lun - Sáb: 7:00am - 11:00pm", href: "#" },
      { label: "Central: +51 955 545 561", href: "https://wa.me/51955545561" },
      { label: "Libro de Reclamaciones", action: 'reclamaciones' },
    ],
  },
]

const SANS_STACK = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif'
const MONO_STACK = SANS_STACK

// #region halftone
// Pure helpers, lifted out and executed by tests/halftone-wordmark-footer.test.mjs.

/** Hex → [r, g, b] in 0–255, or null for anything that isn't #rgb / #rrggbb. */
export function hwfHex(hex: string) {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((hex || "").trim())
  if (!m) return null
  const h = m[1].length === 3 ? m[1].split("").map((c) => c + c).join("") : m[1]
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

/** Dot radius for a cell coverage in [0, 1]: area-true, so tone stays even. */
export function hwfRadius(coverage: number, gap: number) {
  const c = coverage < 0 ? 0 : coverage > 1 ? 1 : coverage
  return Math.sqrt(c) * gap * 0.56
}

/**
 * One step of a dot's spring back to home, plus the push from a pointer at
 * (px, py) within radius r. Returns [x, y, vx, vy]. Away from the pointer a
 * displaced dot always heads home and comes to rest.
 */
export function hwfStep(
  x: number, y: number, vx: number, vy: number,
  hx: number, hy: number, px: number, py: number, r: number,
) {
  const dx = x - px
  const dy = y - py
  const d2 = dx * dx + dy * dy
  if (r > 0 && d2 < r * r) {
    const d = Math.sqrt(d2) + 0.001
    const f = (1 - d / r) * 2.6
    vx += (dx / d) * f
    vy += (dy / d) * f
  }
  vx = (vx + (hx - x) * 0.05) * 0.84
  vy = (vy + (hy - y) * 0.05) * 0.84
  return [x + vx, y + vy, vx, vy]
}

/** How warm a dot is drawn: 0 at home, 1 once it is `span` px or more away. */
export function hwfWarmth(x: number, y: number, hx: number, hy: number, span: number) {
  const d = Math.hypot(x - hx, y - hy)
  return span > 0 ? Math.min(1, d / span) : 0
}

/** Font size that sets `measured` (width at 100px) to fill `width` exactly. */
export function hwfFitSize(measured: number, width: number) {
  return measured > 0 ? (width / measured) * 100 : 0
}
// #endregion

const HWF_CSS = `
.hwf-root {
  position: relative; width: 100%; min-height: 100vh; min-height: 100dvh; overflow: hidden; isolation: isolate;
  background: var(--hwf-bg); color: var(--hwf-ink); -webkit-font-smoothing: antialiased;
  font-family: var(--hwf-font);
  border-top: 1px solid #e4e4e7;
}
.hwf-root canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; max-width: none; }
.hwf-top {
  position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0, 1.35fr) repeat(3, minmax(0, 1fr));
  gap: 32px; padding: clamp(40px, 5.5vh, 60px) clamp(24px, 4vw, 64px) 0;
  font-family: var(--hwf-font); font-size: 14px; line-height: 1.6;
}
.hwf-brand strong { display: flex; align-items: baseline; gap: 4px; font-weight: 900; font-family: var(--hwf-font); font-size: 21px; letter-spacing: -0.02em; }
.hwf-brand span { color: #71717a; display: block; margin-top: 8px; font-size: 13px; line-height: 1.6; max-width: 320px; text-transform: none; letter-spacing: normal; }
.hwf-col h3 { margin: 0; font-family: var(--hwf-font); font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #18181b; }
.hwf-col ul { list-style: none; margin: 0; padding: 0; margin-top: 14px; display: flex; flex-direction: column; gap: 9px; }
.hwf-col a, .hwf-up, .hwf-action-link {
  color: #3f3f46; text-decoration: none; opacity: 1; background: none; border: 0; padding: 0;
  font-family: var(--hwf-font); font-size: 13.5px; font-weight: 500; letter-spacing: normal; text-transform: none; cursor: pointer; text-align: left;
  background-image: linear-gradient(#0d9488, #0d9488); background-size: 0% 1.5px;
  background-repeat: no-repeat; background-position: 0 100%; transition: color .2s ease, background-size .3s cubic-bezier(.2,.7,.1,1);
}
.hwf-col a:hover, .hwf-up:hover, .hwf-action-link:hover { color: #0d9488; background-size: 100% 1.5px; }
.hwf-col a:focus-visible, .hwf-up:focus-visible, .hwf-action-link:focus-visible { outline: 1px solid #0d9488; outline-offset: 3px; }
.hwf-rule {
  position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: center; gap: 16px;
  margin: clamp(18px, 2.6vh, 28px) clamp(24px, 4vw, 64px) 0; padding-top: 16px;
  border-top: 1px solid #e4e4e7;
  font-family: var(--hwf-font); font-size: 12px; font-weight: 500; letter-spacing: normal; text-transform: none; color: #52525b;
}
.hwf-badge { color: #52525b; display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 500; }
.hwf-badge-dot { width: 7px; height: 7px; border-radius: 9999px; background: #0d9488; display: inline-block; box-shadow: 0 0 8px rgba(13, 148, 136, 0.4); }
.hwf-up { font-size: 12px; font-weight: 600; color: #18181b; }
.hwf-up:hover { color: #0d9488; }
.hwf-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
@media (max-width: 720px) {
  .hwf-top { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); row-gap: 20px; padding-top: 36px; }
  .hwf-brand { grid-column: 1 / -1; }
  .hwf-rule { flex-direction: column-reverse; align-items: flex-start; gap: 12px; margin-top: 18px; }
}
@media (prefers-reduced-motion: reduce) {
  .hwf-col a, .hwf-up { transition: none; }
}
`

export default function HalftoneWordmarkFooter({
  wordmark = "nova salud",
  label = "BOTICA NOVA SALUD",
  meta = "©2026 · Av. Principal 1248, Lima · Q.F. Regente Colegiada CQFP",
  columns = DEFAULT_COLUMNS,
  backToTop = true,
  preset = "light",
  palette,
  dotGap = 6,
  radius = 90,
  crop = 0.16,
  grain = 0.4,
  interactive = true,
  fontFamily = SANS_STACK,
  fontWeight = 900,
  monoFamily = MONO_STACK,
  height = "100vh",
  className = "",
}: HalftoneWordmarkFooterProps) {
  const colors = { ...(PRESETS[preset] || PRESETS.light), ...(palette || {}) }
  const rootRef = React.useRef<HTMLElement | null>(null)
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const opts = React.useRef({ colors, dotGap, radius, crop, grain, interactive, fontFamily, fontWeight, wordmark })
  opts.current = { colors, dotGap, radius, crop, grain, interactive, fontFamily, fontWeight, wordmark }
  const key = [wordmark, dotGap, crop, grain, fontFamily, fontWeight, colors.background, colors.ink, colors.warm].join("|")

  React.useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    if (!root || !canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let w = 0
    let h = 0
    let dpr = 1
    let px = -1e5
    let py = -1e5
    let raf = 0
    let visible = true
    let awake = true
    let ring = { x: 0, y: 0, t: -1 }
    // Flat arrays: x, y, vx, vy, hx, hy, r, isSalud per dot (8 floats per dot)
    let dots = new Float32Array(0)
    let count = 0
    let grainTile = null as HTMLCanvasElement | null
    const isLightBg = colors.background.toLowerCase() === "#ffffff" || colors.background.toLowerCase() === "#fff"
    const novaInk = hwfHex(opts.current.colors.ink) || [17, 24, 39]
    const novaWarm = [13, 148, 136] // Warms toward teal on interaction
    const saludInk = [13, 148, 136] // #0d9488 Verde Agua
    const saludWarm = [45, 212, 191] // #2dd4bf Bright Mint

    const layout = () => {
      const o = opts.current
      const rect = root.getBoundingClientRect()
      w = Math.max(1, Math.round(rect.width))
      h = Math.max(1, Math.round(rect.height))
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)

      // Set the word on a 1x mask canvas
      const mask = document.createElement("canvas")
      mask.width = w
      mask.height = h
      const m = mask.getContext("2d", { willReadFrequently: true })
      if (!m) return
      const face = o.fontWeight + " 100px " + o.fontFamily
      m.font = face
      const word = o.wordmark || "nova salud"

      // Measure the position of the rule line to position wordmark nicely below it
      const ruleEl = root.querySelector(".hwf-rule") as HTMLElement | null
      const ruleBottom = ruleEl ? (ruleEl.offsetTop + ruleEl.offsetHeight) : Math.round(h * 0.38)
      const spaceBelow = Math.max(160, h - ruleBottom)

      // Fit font size by width (94% width) AND constrain by spaceBelow
      const fitByWidth = hwfFitSize(m.measureText(word).width, w * 0.94)
      const maxTextHeight = Math.max(90, spaceBelow - 40)
      const fitByHeight = maxTextHeight / 0.88
      const fit = Math.min(fitByWidth, fitByHeight)

      m.font = o.fontWeight + " " + fit + "px " + o.fontFamily
      const box = m.measureText(word)
      const cap = box.actualBoundingBoxAscent || fit * 0.72
      const descent = box.actualBoundingBoxDescent || fit * 0.18

      // Center vertically in spaceBelow
      const centerY = ruleBottom + spaceBelow / 2
      const textY = centerY + (cap - descent) / 2

      // Separate words to color "nova" in Black and "salud" in Verde Agua (#0d9488)
      const words = word.trim().split(/\s+/)
      const word1 = words[0] || "nova"
      const word2 = words.slice(1).join(" ") || "salud"

      const fullWidth = m.measureText(word).width
      const w1Width = m.measureText(word1).width
      const w2Width = m.measureText(word2).width
      const spaceWidth = Math.max(0, fullWidth - (w1Width + w2Width))
      const startX = (w - fullWidth) / 2
      const w2StartX = startX + w1Width + spaceWidth

      m.textBaseline = "alphabetic"
      // Render word1 ("nova") with pure RED channel (flag for black)
      m.fillStyle = "rgb(255, 0, 0)"
      m.fillText(word1, startX, textY)

      // Render word2 ("salud") with pure GREEN channel (flag for teal)
      m.fillStyle = "rgb(0, 255, 0)"
      m.fillText(word2, w2StartX, textY)

      const img = m.getImageData(0, 0, w, h).data

      const gap = Math.max(3, o.dotGap)
      const cols = Math.ceil(w / gap)
      const rows = Math.ceil(h / gap)
      const tmp: number[] = []
      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          // Coverage: average alpha over a 3×3 sample of the cell.
          let sumAlpha = 0
          let sumRed = 0
          let sumGreen = 0
          for (let sy = 0; sy < 3; sy++) {
            for (let sx = 0; sx < 3; sx++) {
              const x = Math.min(w - 1, Math.floor(gx * gap + ((sx + 0.5) * gap) / 3))
              const y = Math.min(h - 1, Math.floor(gy * gap + ((sy + 0.5) * gap) / 3))
              const idx = (y * w + x) * 4
              sumAlpha += img[idx + 3]
              sumRed += img[idx + 0]
              sumGreen += img[idx + 1]
            }
          }
          const cov = sumAlpha / (9 * 255)
          if (cov < 0.06) continue
          const hx = gx * gap + gap / 2
          const hy = gy * gap + gap / 2
          // 0 = nova (black), 1 = salud (teal)
          const isSalud = sumGreen > sumRed ? 1 : 0
          tmp.push(hx, hy, 0, 0, hx, hy, hwfRadius(cov, gap), isSalud)
        }
      }
      dots = new Float32Array(tmp)
      count = tmp.length / 8

      // A fixed tile of print grain, drawn once and laid over every frame.
      grainTile = document.createElement("canvas")
      grainTile.width = 256
      grainTile.height = 256
      const g = grainTile.getContext("2d")
      if (g) {
        const id = g.createImageData(256, 256)
        for (let i = 0; i < id.data.length; i += 4) {
          const v = Math.random() * 255
          id.data[i] = id.data[i + 1] = id.data[i + 2] = v
          id.data[i + 3] = Math.random() < 0.5 ? 0 : 255
        }
        g.putImageData(id, 0, 0)
      }
      awake = true
    }

    const draw = (now: number) => {
      const o = opts.current
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = o.colors.background
      ctx.fillRect(0, 0, w, h)

      const r = o.interactive && !reduced ? Math.max(0, o.radius) : 0
      const ringAge = ring.t < 0 ? 1e9 : now - ring.t
      const ringR = ringAge * 0.9
      let moving = false
      for (let i = 0; i < count; i++) {
        const j = i * 8
        let x = dots[j]
        let y = dots[j + 1]
        let vx = dots[j + 2]
        let vy = dots[j + 3]
        const hx = dots[j + 4]
        const hy = dots[j + 5]
        const radius = dots[j + 6]
        const isSalud = dots[j + 7] === 1

        if (!reduced) {
          if (ringAge < 900) {
            const dx = hx - ring.x
            const dy = hy - ring.y
            const d = Math.sqrt(dx * dx + dy * dy) + 0.001
            const band = 1 - Math.min(1, Math.abs(d - ringR) / 26)
            if (band > 0) {
              const f = band * 3.2 * (1 - ringAge / 900)
              vx += (dx / d) * f
              vy += (dy / d) * f
            }
          }
          const s = hwfStep(x, y, vx, vy, hx, hy, px, py, r)
          x = s[0]
          y = s[1]
          vx = s[2]
          vy = s[3]
          if (Math.abs(vx) + Math.abs(vy) > 0.02 || Math.abs(x - hx) + Math.abs(y - hy) > 0.05) moving = true
          else {
            x = hx
            y = hy
            vx = 0
            vy = 0
          }
          dots[j] = x
          dots[j + 1] = y
          dots[j + 2] = vx
          dots[j + 3] = vy
        }

        const k = hwfWarmth(x, y, hx, hy, 28)
        const baseInk = isSalud ? saludInk : novaInk
        const warmColor = isSalud ? saludWarm : novaWarm

        if (k > 0.02) {
          ctx.fillStyle =
            "rgb(" +
            Math.round(baseInk[0] + (warmColor[0] - baseInk[0]) * k) + "," +
            Math.round(baseInk[1] + (warmColor[1] - baseInk[1]) * k) + "," +
            Math.round(baseInk[2] + (warmColor[2] - baseInk[2]) * k) + ")"
        } else {
          ctx.fillStyle = isSalud ? "#0d9488" : opts.current.colors.ink
        }
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, 6.2832)
        ctx.fill()
      }

      if (grainTile && o.grain > 0) {
        if (isLightBg) {
          ctx.globalAlpha = Math.min(1, o.grain) * 0.025
          ctx.globalCompositeOperation = "multiply"
        } else {
          ctx.globalAlpha = Math.min(1, o.grain) * 0.09
          ctx.globalCompositeOperation = "overlay"
        }
        const pattern = ctx.createPattern(grainTile, "repeat")
        if (pattern) {
          ctx.fillStyle = pattern
          ctx.fillRect(0, 0, w, h)
        }
        ctx.globalAlpha = 1
        ctx.globalCompositeOperation = "source-over"
      }
      // Sleep once everything is home and nothing is pushing.
      awake = moving || ringAge < 900 || px > -1e4
    }

    const loop = (now: number) => {
      raf = 0
      if (!visible) return
      draw(now)
      if (awake) raf = requestAnimationFrame(loop)
    }
    const wake = () => {
      awake = true
      if (!raf && visible) raf = requestAnimationFrame(loop)
    }

    const toLocal = (e: globalThis.PointerEvent) => {
      const b = canvas.getBoundingClientRect()
      return [e.clientX - b.left, e.clientY - b.top]
    }
    const onMove = (e: globalThis.PointerEvent) => {
      if (!opts.current.interactive) return
      const p = toLocal(e)
      px = p[0]
      py = p[1]
      wake()
    }
    const onLeave = () => {
      px = -1e5
      py = -1e5
      wake()
    }
    const onDown = (e: globalThis.PointerEvent) => {
      if (!opts.current.interactive || reduced) return
      if ((e.target as HTMLElement).closest("a,button")) return
      const p = toLocal(e)
      ring = { x: p[0], y: p[1], t: performance.now() }
      wake()
    }

    layout()
    draw(performance.now())
    wake()

    root.addEventListener("pointermove", onMove)
    root.addEventListener("pointerleave", onLeave)
    root.addEventListener("pointerdown", onDown)
    const ro = new ResizeObserver(() => {
      layout()
      wake()
    })
    ro.observe(root)
    const io = new IntersectionObserver((entries) => {
      visible = entries[0] ? entries[0].isIntersecting : true
      if (visible) wake()
    })
    io.observe(root)
    // A web font that lands late re-sets the word in its real face.
    let alive = true
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (!alive) return
        layout()
        wake()
      })
    }

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      root.removeEventListener("pointermove", onMove)
      root.removeEventListener("pointerleave", onLeave)
      root.removeEventListener("pointerdown", onDown)
    }
  }, [key])

  const toTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer
      ref={rootRef}
      className={"hwf-root " + className}
      style={
        {
          height,
          "--hwf-bg": colors.background,
          "--hwf-ink": colors.ink,
          "--hwf-font": fontFamily,
          "--hwf-mono": monoFamily,
        } as React.CSSProperties
      }
    >
      <style>{HWF_CSS}</style>
      <canvas ref={canvasRef} aria-hidden="true" />
      <span className="hwf-sr">{wordmark}</span>
      <div className="hwf-top">
        <div className="hwf-brand">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-zinc-400 mb-1">
            BOTICA
          </div>
          <strong>
            <span style={{ color: "#111827", fontWeight: 900 }}>NOVA</span>
            <span style={{ color: "#0d9488", fontWeight: 900, marginLeft: "4px" }}>SALUD</span>
          </strong>
          <span>{meta}</span>
        </div>
        {columns.map((col) => (
          <nav className="hwf-col" key={col.title} aria-label={col.title}>
            <h3>{col.title}</h3>
            <ul>
              {col.links.map((l) => (
                <li key={l.label}>
                  {l.action === 'reclamaciones' ? (
                    <button
                      type="button"
                      onClick={() => window.dispatchEvent(new CustomEvent('open-reclamaciones'))}
                      className="hwf-action-link"
                    >
                      {l.label}
                    </button>
                  ) : l.action === 'services' ? (
                    <button
                      type="button"
                      onClick={() =>
                        window.dispatchEvent(
                          new CustomEvent('open-services', { detail: { serviceId: l.serviceId } })
                        )
                      }
                      className="hwf-action-link"
                    >
                      {l.label}
                    </button>
                  ) : l.action === 'location' ? (
                    <button
                      type="button"
                      onClick={() => window.dispatchEvent(new CustomEvent('open-location'))}
                      className="hwf-action-link"
                    >
                      {l.label}
                    </button>
                  ) : l.action === 'brand' ? (
                    <button
                      type="button"
                      onClick={() =>
                        window.dispatchEvent(
                          new CustomEvent('open-brand', { detail: { tab: l.tab || 'historia' } })
                        )
                      }
                      className="hwf-action-link"
                    >
                      {l.label}
                    </button>
                  ) : l.href && l.href.startsWith('/') ? (
                    <Link
                      to={l.href}
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                      {l.label}
                    </Link>
                  ) : (
                    <a href={l.href || "#"}>{l.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="hwf-rule">
        <div className="hwf-badge">
          <span className="hwf-badge-dot" />
          <span>Atención Farmacéutica Continua · DIGEMID Certificado</span>
        </div>
        {backToTop ? (
          <button type="button" className="hwf-up" onClick={toTop}>
            Volver arriba ↑
          </button>
        ) : null}
      </div>
    </footer>
  )
}

