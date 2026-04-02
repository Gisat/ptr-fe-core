# MapTooltip Refactoring Plan
## Context
The `MapTooltip` folder (`src/client/map/MapSet/MapTooltip/`) implements two tooltip **flavors** and two **layer types**:
- **Native** flavor — DeckGL-managed HTML string tooltip, assembled by `getMapTooltip.ts` and rendered by DeckGL's `getTooltip` callback in `SingleMap.tsx`.
- **Custom** flavor — React component overlay tooltip, rendered by `getLayerTooltip.tsx` using `MapTooltip.tsx` or a user-supplied `CustomTooltip` prop.
- **Vector** layer type — GeoJSON/feature-property-based (used by `GeojsonLayerSource`, `IconLayerSource`).
- **COG** layer type — raster pixel-value-based (used by `COGLayerSource`).
### Files Involved
- `src/client/map/MapSet/MapTooltip/getMapTooltip.ts` — native tooltip dispatcher + private COG/vector helpers
- `src/client/map/MapSet/MapTooltip/getMapTooltip.css` — CSS for `.ptr-NativeMapTooltip`
- `src/client/map/MapSet/MapTooltip/getLayerTooltip.tsx` — custom (React) tooltip dispatcher
- `src/client/map/MapSet/MapTooltip/MapTooltip.tsx` — default custom tooltip React component
- `src/client/map/MapSet/MapTooltip/MapTooltip.css` — CSS for `.ptr-MapTooltip`
- `src/client/map/MapSet/MapTooltip/buildNativeTooltipResult.ts` — assembles DeckGL tooltip return object
- `src/client/map/components/layers/GeojsonLayerSource.tsx` — vector layer, duplicates tooltipType resolution
- `src/client/map/components/layers/IconLayerSource.tsx` — icon layer, duplicates tooltipType resolution
- `src/client/map/components/layers/COGLayerSource.tsx` — COG layer source
- `src/client/shared/models/models.tooltip.ts` — `TooltipType`, `TooltipAttribute`, `NativeTooltipSettings`, `VectorTooltipSettings`, `CogTooltipSettings`
- `src/client/shared/models/parsers.datasources.ts` — `parseDatasourceConfiguration` returns `object | undefined` (untyped)
---
## Steps
Each step is self-contained and verifiable before the next begins. No step depends on a previous one being done first.
### Step 1 — Consolidate duplicate CSS
Merge `getMapTooltip.css` and `MapTooltip.css` into a single `tooltip.css`. Both files define identical layout, box-shadow, border-radius, indicator triangle, and row/label/value rules. The only real differences are the background-color variable (`--base0` vs `--base25`) and the indicator border-top color. Update the CSS imports in `getMapTooltip.ts` and `MapTooltip.tsx` to point to the new file.
**Verify:** visual appearance of both native and custom tooltips is unchanged.
---
### Step 2 — Extract `resolveTooltipType` helper
The expression `tooltipSettings?.type ?? (hasCustomTooltip ? TooltipType.Hover : TooltipType.Native)` plus the "Native + CustomTooltip → Hover" override is copy-pasted identically in `GeojsonLayerSource.tsx`, `IconLayerSource.tsx`, and inside `getLayerTooltip.tsx`. Extract to a new file `src/client/map/MapSet/MapTooltip/resolveTooltipType.ts` and update all three callers.
**Verify:** TypeScript compiles, tooltip behaviour identical in all layer types.
---
### Step 3 — Split `getMapTooltip.ts` into focused files
Extract the private `getCogTooltip` and `getVectorTooltip` functions into `getCogNativeTooltip.ts` and `getVectorNativeTooltip.ts` respectively (keeping `config: any` for now — types are addressed in Step 4). Leave `getMapTooltip.ts` as a thin dispatcher of ~15 lines. No behaviour change.
**Verify:** TypeScript compiles, native tooltips render identically.
---
### Step 4 — Add `DatasourceConfiguration` type and remove `any`
`parseDatasourceConfiguration` in `parsers.datasources.ts` currently returns `object | undefined`. Create a `DatasourceConfiguration` interface covering at minimum:
- `cogBitmapOptions` — with `useChannel`, `disableTooltip`, `tooltipSettings: CogTooltipSettings`
- `geojsonOptions` — with `disableTooltip`, `tooltipSettings: VectorTooltipSettings`
Update the return type of `parseDatasourceConfiguration`. Replace `config: any` in `getCogNativeTooltip.ts` and `getVectorNativeTooltip.ts` (created in Step 3) with the new type.
> **Note:** `DatasourceConfiguration` will likely need to grow over time to cover other usages (`layerStyle`, `selectionStyle`, `featureIdProperty`, etc.) — start with the minimum needed here.
**Verify:** TypeScript compiles with no `any` on config access paths in the native tooltip helpers; existing callers of `parseDatasourceConfiguration` still resolve correctly.
---
### Step 5 — Add barrel export + feature doc
Create `src/client/map/MapSet/MapTooltip/index.ts` exporting all public symbols (`getMapTooltip`, `getLayerTooltip`, `MapTooltip`, `buildNativeTooltipResult`, `resolveTooltipType`, and the helpers from Step 3). Add `Tooltip.md` in the `MapTooltip/` folder explaining the two-flavor × two-layer-type matrix and mapping each combination to its owning file.
**Verify:** all existing imports still resolve; documentation is readable in IDE.
---
## Further Considerations
- **Step 4 cascade risk** — `DatasourceConfiguration` is accessed broadly across layer sources beyond just tooltips. If the new type is too strict it may cause type errors in unrelated files. Start with `Partial<>` shapes or use `unknown` for properties not yet typed.
- **COG/Vector split in `getLayerTooltip.tsx`** — splitting the function into `getVectorLayerTooltip` / `getCogLayerTooltip` would be cleaner long-term (the `pixelInfo` and `featureInfo` paths currently coexist in one function and one params interface) but is explicitly **out of scope** for this refactoring.