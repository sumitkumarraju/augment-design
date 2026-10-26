# Hyperframes Composition Brief: AUGMENT Context OS

## Objective
Create a 15-second polished launch video for AUGMENT Context OS.

## Output
- Composition directory: `brag-output-2026-10-26-233610/composition/`
- Rendered video: `brag-output-2026-10-26-233610/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 15 seconds

## Source material
- Project root: `/Users/skr/jarvis/AUGMENT -DESIGN`
- Primary files read: `src/components/MissionWorkspace.tsx`, `src/components/IntroPreloader.tsx`, `src/components/MacBookSurface.tsx`, `src/components/MacBookExperience.tsx`, `src/index.css`, `PRODUCT_DIRECTION.md`
- Product name: AUGMENT / Context OS
- Strongest claim: “AUGMENT is a research-to-action workspace. It reads the signal, holds the context, and gives you the next useful move.”
- Key UI moment: Mission Builder → source pipeline → AUGMENT Brief with SOURCE TRAIL and NEXT ACTIONS.
- Copy that must appear verbatim:
  - MAKE THE NEXT MOVE CLEAR.
  - MISSION BUILDER
  - AUGMENT BRIEF
  - SOURCE TRAIL
  - NEXT ACTIONS
  - SAVE CASE

## Creative direction
- Tone preset: polished
- Creative direction: premium MacBook-style product film with a cursor acting as the guide.
- Angle: show the working research loop, not an abstract AI promise.
- Hook: red boot loading line into “MAKE THE NEXT MOVE CLEAR.”
- Outro: SAVE CASE confirmation and the research-to-action loop.
- Avoid generic SaaS copy, abstract filler, invented stats, and unrelated redesign.

## Visual identity
- Background: #030303 / #080808
- Text: #ffffff, #d1d5db, #9ca3af
- Accent: #f87171 / #7f1d1d
- Display font: JetBrains Mono
- Body font: JetBrains Mono
- References: boot loader, dark mission workspace, red active state, source chips, brief sections, cursor zoom/hover treatment.

## Storyboard
Use `brag-plan.md` as the creative contract:
1. Boot / hook — 2.5s
2. Mission Builder — 3.5s
3. Source pipeline — 3.5s
4. Cited brief / save — 3.5s
5. Lockup — 2.0s

## Audio
- Audio role: sparse professional accents with a warm electronic bed.
- Audio arc: pulse at boot, ticks on cursor interactions, confirmation on save, fade on lockup.
- Music: generated local synth bed `assets/music/augment-pulse.wav`.
- Music treatment: -18dB bed, fade in 0.4s, lift around 7.6s, fade out over final 1.2s.
- Music cue guidance: major cues at 2.4s, 7.6s, and 13.2s.
- Audio-reactive treatment: subtle red core/glow scale tied to a deterministic pulse.
- Audio-coupled moments: type-in ticks, mode hover ticks, save confirmation.
- SFX selection guidance: short low-volume UI ticks; exact SFX is composed in the local timeline.
- Exact SFX choice: inline Web Audio chirps synthesized in the composition, avoiding external assets.

## Hyperframes instructions
- Use one paused root timeline registered as `window.__timelines.main`.
- Every timed element has `data-start`, `data-duration`, and `class="clip"`.
- Use deterministic GSAP animation only.
- Keep all copy readable and grounded in the source project.
- Include a visible cursor with zoomed hover targets and at least one real product UI flow.
- Run `npm run check`, snapshot key frames, render delivery-quality MP4, extract a settled poster frame, and bake it into frame 0.
