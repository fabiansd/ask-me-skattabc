# Optimalskatt Design System

The `optimalskatt` DaisyUI theme. All components should consume these tokens — do not hand-roll hex or ad-hoc Tailwind color classes.

> This file is populated at the end of Phase 2 of the revamp. Until then, treat it as the source of truth for what the tokens WILL be. During Phase 2 it becomes the source of truth for what they ARE.

## Palette

| Token | Hex | Use |
|---|---|---|
| `base-100` | `#FBF8F1` | Page background (ivory) |
| `base-200` | `#F3EEE3` | Cards, sidebar surface, subtle bands |
| `base-300` | `#E7DFCE` | Borders, dividers, disabled fills |
| `base-content` | `#1B2430` | Default text (deep ink) |
| `primary` | `#1F3A5F` | Navy — primary buttons, active states, links |
| `primary-content` | `#FBF8F1` | Text on primary |
| `secondary` | `#B08A3E` | Muted gold — secondary highlights, hover accents, brand mark |
| `secondary-content` | `#1B2430` | Text on secondary |
| `accent` | `#7D3C2E` | Burgundy — sparing use: destructive confirms, critical badges |
| `neutral` | `#2B3440` | Dark surface for tooltips / toasts |
| `neutral-content` | `#F3EEE3` | Text on neutral |
| `info` | `#2C5E8A` |  |
| `success` | `#3F7D5B` |  |
| `warning` | `#B8823C` |  |
| `error` | `#A0392B` |  |

Rounded radii: `--rounded-btn: 0.375rem`, `--rounded-box: 0.75rem`.

## Typography

| Role | Family | Tailwind | CSS var |
|---|---|---|---|
| Display / headings | Fraunces (variable, 400–700) | `font-serif` | `--font-serif` |
| Body / UI | Inter (400/500/600) | `font-sans` | `--font-sans` |
| Mono (rare) | ui-monospace system | `font-mono` | n/a |

Both fonts load via `next/font/google` in `app/layout.tsx` and expose CSS variables on `<html>`.

Default scale (Tailwind):

- `text-xs` — 12px, UI meta, keyword pills
- `text-sm` — 14px, body
- `text-base` — 16px, default
- `text-lg` — 18px, subhead
- `text-xl` — 20px, section titles
- `text-2xl` — 24px, card titles
- `text-4xl` — 36px, display (hero)
- `text-5xl` — 48px, marketing (unused today)

Headings use `font-serif font-medium tracking-tight`; body uses `font-sans`.

## Spacing & layout

- 4pt grid (Tailwind defaults); prefer multiples of 4
- Max content widths: chat thread `max-w-3xl`, page container `max-w-5xl`
- Sidebar widths: conversation drawer `w-80` desktop / full-width mobile; sources drawer `min(640px, 90vw)`
- Header heights: 56px mobile, 72px desktop
- Safe-area aware on mobile (`pb-[env(safe-area-inset-bottom)]` on bottom input bar)

## Component primitives

All under `app/src/components/common/`.

### `<Button>`

```tsx
<Button variant="primary" size="md" loading={false} onClick={...}>Send</Button>
```

Props:

- `variant`: `'primary' | 'secondary' | 'ghost' | 'danger'` (default `'primary'`)
- `size`: `'sm' | 'md'` (default `'md'`)
- `loading`: shows inline spinner + preserves label
- All native `<button>` props pass through

Replaces every inline `btn bg-sky-700 ...` across the codebase. Danger uses `accent` (burgundy), not red.

### `<Card>`

```tsx
<Card variant="surface">...</Card>
```

Props:

- `variant`: `'surface'` (ivory + 1px `base-300` border) | `'elevated'` (surface + subtle shadow)

Used for: chat bubbles, account card, info sections.

### `<Tooltip>`

Unchanged API from the original (`text` + children). Restyled: `bg-neutral`, `text-neutral-content`, 6px radius, soft shadow, appears above on desktop and below on mobile when near top.

### `<IconButton>`

```tsx
<IconButton label="Skjul sidebar" onClick={...}>
  <svg>...</svg>
</IconButton>
```

Props:

- `label` (required, goes to `aria-label` + `title`)
- `size`: `'sm' | 'md'` (default `'sm'`)
- `variant`: `'ghost' | 'subtle'`

Normalizes the 4+ ad-hoc `<button>`-wrapping-`<svg>` styles that existed pre-revamp.

## Motion

- Micro-transitions: `transition-colors duration-150`
- Drawer open: `transition-transform duration-300 ease-out`
- Modals: fade in 200ms, scale-up 150ms from `scale-95`
- No parallax, no confetti. This is a legal product.

## Accessibility

- All interactive elements: visible `focus-visible:ring-2 focus-visible:ring-secondary`
- Minimum hit target 40×40 on mobile
- Color contrast: body text ≥ 7:1 on `base-100`, primary button text ≥ 4.5:1 on primary
- Skip-to-content link in `app/layout.tsx`

## What NOT to do

- Don't use `bg-sky-*`, `text-white`, or raw hex anywhere. Always tokens.
- Don't use the DaisyUI `swap` component — use the `ToggleModelDepth` segmented control pattern.
- Don't hand-roll focus rings. They're on primitives.
- Don't set explicit `height: 100vh` on mobile — use `100dvh` or flex `min-h-0`.
