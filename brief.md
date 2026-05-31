# Better Track — Design Brief

## Register

Product. The interface is an instrument. The user opens it monthly or biweekly to manage money. Speed, clarity, and trust matter more than visual novelty.

## Users

Individual managing personal finances in MXN. Spanish-speaking, paid biweekly (quincena). Arrives with mild financial anxiety — wants reassurance that things are under control, not a spreadsheet experience.

## Purpose

Track income and expenses using the 50/30/20 rule. Split across two pay periods per month. Show where money goes, what's left, and whether the user is on target.

## Artifact

Budget entries — each has a name, amount, category (needs/wants/savings), quincena (1ra/2da), optional note, and paid status. The artifact is a living monthly budget sheet, not a one-time report.

## Voice

Warm, grounded, confident. Like a well-organized financial notebook. Direct copy — no filler, no marketing preamble, no exclamation points. Sentence case everywhere. One verb per button.

## Anti-references

- Generic SaaS landing page with centered hero, pill badges, and gradient blobs
- Cold calculator aesthetic with pure neutral grays
- Neubrutalist or playful-blocky visual language
- Blue-violet CTAs or blue-purple gradients
- Inter as a decorative brand font on marketing surfaces (fine for product UI)

## Design Principles

1. **Warmth over neutrality.** Surfaces are tinted toward warm stone (hue 55-75 in OKLCH), not pure gray. The user should feel grounded, not like they opened a terminal.
2. **Category colors carry meaning.** Blue = needs, amber = wants, emerald = savings. These are data colors, not chrome colors. Never use them for buttons or navigation.
3. **Primary is for action.** Forest green (OKLCH hue 165) is the chrome color — buttons, links, focus rings, active states. It signals trust and growth without competing with category data.
4. **Density is respect.** The user has a lot of numbers to scan. Small type (12-13px), tight rows, tabular numerals. Don't waste vertical space on decorative breathing room in the dashboard.
5. **Rounded, not sharp.** Cards, dialogs, buttons, and inputs use rounded-lg (8px). Progress bars are pill-shaped. The old rounded-none language was too cold.
6. **Subtle depth.** Cards have thin borders and shadow-sm. Dialogs have shadow-xl. No gratuitous elevation — depth signals interactivity, not decoration.
7. **Optimistic by default.** Mutations update the UI before the server responds. The interface should never feel like it's waiting.

## Visual Foundation

- **Color system:** OKLCH tokens in CSS custom properties. Warm-stone neutrals (chroma ~0.005-0.015, hue 55-75). Forest green primary. Category colors via `--color-needs`, `--color-wants`, `--color-savings`.
- **Typography:** Inter Variable. Body at 12-13px for density. Headings use tracking-tight and semibold/bold weight. Tabular numerals for all money values.
- **Spacing:** 4px base unit. Card padding 16px. Section gaps 16-24px.
- **Borders:** 1px solid at `border-border/60` for cards. Full opacity for structural dividers.
- **Shadows:** `shadow-sm` for cards, `shadow-lg` for dropdowns, `shadow-xl` for dialogs.
- **Radius:** `rounded-md` (6px) for buttons/inputs, `rounded-lg` (8px) for cards/overlays, `rounded-full` for progress bars and status dots.
- **Dark mode:** Default. Light mode available via theme toggle. Both share the warm direction.

## Composition Lanes

The dashboard is a **compare** surface — three category columns side by side, each showing budget vs. actual with progress bars. The overview panel and donut chart provide **monitor** context. The landing page is a **decide** surface — focused pitch with proof (the budget bar showcase) and one dominant CTA.

## Component Rules

- Entry rows are dense: checkbox, name, amount. Edit via inline form or context menu. Drag handle appears on hover.
- Category sections split into two quincena columns with subtotals.
- Progress bars show spent/budget as a percentage. Red when over budget.
- Dialogs are compact (max-w-xs for entry forms). Three actions: Cancel, Add another, Add.
- Empty states say what belongs and how to fill it. "No entries" is not enough — "Add your first income entry to get started" is.

## Accessibility

- Focus rings: 2-3px, offset, using `ring-ring/50` token. Never remove outlines without replacement.
- Touch targets: Minimum 44px. Checkbox hit area expanded via `::after` pseudo-element.
- Color contrast: All text meets WCAG AA against its background in both light and dark modes.
- Keyboard: All interactive elements reachable and operable via keyboard. Context menu accessible via right-click and keyboard.
