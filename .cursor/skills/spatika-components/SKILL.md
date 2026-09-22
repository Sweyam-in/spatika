---
name: spatika-components
description: Pick the right Spatika (@spatika/react) primitive or composite instead of custom chrome or another UI kit. Use when building screens, forms, dialogs, navigation, or cards.
---

# Spatika component map

Import from `@spatika/react`. Prefer a kit export over a new styled `div`.

## Theme

- `SpatikaThemeProvider`, `useSpatikaTheme`, `applyTheme`
- Theme ids: `mukta`, `neelam`, `usha`, `sandhya`

## Primitives

`Button` (variants: `default`, `secondary`, `outline`, `ghost`, `glass`, `destructive`, `link`; sizes include `touch` / `icon-touch`), `Badge`, `Input`, `Textarea`, `Label`, `Separator`, `Skeleton`, `Checkbox`, `Switch`, `RadioGroup`, `Progress`, `Slider`, `Avatar`, `Select`, `NativeSelect`, `Spinner`, `Alert`, `Kbd`, `Tabs`, `Table`, `Dialog`, `AlertDialog`, `Sheet`, `Popover`, `DropdownMenu`, `Command`, `Tooltip`, `Accordion`, `StarRating`.

## Composites

`PageShell`, `PageHeader`, `PageStickyHeader`, `AppHeader`, `AppSidebar`, `FloatingPageChrome`, `MobileTabBar`, `Card`, `GlassCard`, `SurfaceCard`, `SectionPanel`, `EntityCard`, `StatCard`, `EmptyState`, `FormField`, `SearchField`, `CommandSearchField`, `Chip`, `ChipGroup`, `SegmentedControl`, `FilterSheet`, `BottomSheet`, `NotificationBell`, `Toaster`, `Timeline`, `AmountInput`, `CoverHero`, `ProfileHero`, `PinPad`, `LockOverlay`.

If nothing in the kit fits, compose the closest exports (`GlassCard` + `Button` + `EmptyState`) before inventing a new primitive. New primitives belong upstream in `@spatika/react`, not in the app.
