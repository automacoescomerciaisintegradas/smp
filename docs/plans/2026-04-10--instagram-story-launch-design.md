# Design: Instagram Story Launch 9x16

**Date:** 2026-04-10
**Author:** Codex
**Status:** Approved

## Purpose
Create a premium 9:16 Instagram Story image for the launch announcement using the provided copy.

## Goals
- Premium look: dark base with warm gradient highlights.
- Clear hierarchy for headline, urgency, and CTA.
- Preserve the provided text verbatim (including emojis).
- Deliver a final bitmap output for immediate use.

## Scope
### In Scope
- One 9:16 PNG story asset with the supplied copy.
- A single visual direction (black + warm gradient + gold accents).
- Output saved under `output/imagegen/`.

### Out of Scope
- Multiple variants or A/B tests.
- Animated story or video.
- Editable template files (Canva/Figma).

## Design
### Architecture
Use the image generation CLI to render a high-quality story image, then post-process to exact 9:16 if needed.

### Data Flow
1. Build prompt with the exact copy and visual direction.
2. Generate a portrait image via `image_gen.py`.
3. Crop/resize to 1080x1920 if the generator size is not exact.
4. Save final PNG to `output/imagegen/`.

### Interfaces
- Final asset: `output/imagegen/instagram-story-launch-9x16-1080x1920.png`.

## Alternatives Considered
1. Generate a Canva/Figma layout instead of bitmap.
2. Generate multiple variants for testing.

## Testing Strategy
- Confirm output dimensions are 1080x1920.
- Visually verify text is legible and matches the provided copy.

## Risks
- Long text may render with minor inaccuracies.

## Mitigations
- Prompt explicitly for verbatim text and high legibility.
- Iterate once if text accuracy is off.

## Open Questions
None.
