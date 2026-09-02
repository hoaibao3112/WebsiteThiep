# Implementation plan: Elegant VIP opening experience

## Context

Implement the approved VIP-only opening experience without adding dependencies or changing FREE card limits. Existing `WaxSealOpening` creates audio and timers internally, while `AudioPlayer` can autoplay; both need gesture-first behavior and reduced-motion support.

## Approach

1. Add pure `getMonogram` helper and tests for Vietnamese/missing-name cases.
2. Extend card/guest types with capability and structured guest data.
3. Refactor `AudioPlayer` to lazy-create/play after an explicit user gesture, retain manual play fallback, and clean up Howl on unmount.
4. Refactor `WaxSealOpening` to accept structured guest/monogram, render Elegant VIP only when capability is true, use CSS transform/opacity animation, support reduced-motion media preference and an in-card toggle, and clean up its timer.
5. Pass capability and guest phone/name through all public category views; ensure public page does not enable VIP from client-controlled data.
6. Add backend capability serialization from plan without leaking plan internals.
7. Add component/helper tests for gesture audio, fallback after play rejection, VIP/FREE visual branching, reduced motion, cleanup, and accessibility.
8. Run frontend/backend tests and production builds.

## Files

- `fe/src/lib/guest/monogram.ts`, tests
- `fe/src/components/shared/AudioPlayer.tsx`
- `fe/src/components/shared/OpeningEffect/WaxSealOpening.tsx`
- `fe/src/types/card.types.ts`
- `fe/src/app/(public)/thiep/[slug]/page.tsx`
- `fe/src/components/{wedding,birthday,newborn}/*View.tsx`
- `be/src/services/card.service.ts` and response tests

## Constraints

- VIP capability is server-derived; FREE cannot turn it on with query/local storage.
- No audio before click; `play()` rejection never blocks opening.
- Use existing Framer Motion/CSS only; no particle/canvas layer.
- Do not add autoplay or animation regressions to existing public cards.

## Verification

```powershell
cd fe; npm.cmd test -- --run; npm.cmd run build
cd ../be; npm.cmd test -- --run; npm.cmd run build
```

Expected: all tests pass and both builds exit 0.
