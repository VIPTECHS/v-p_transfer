Skill: Image Reveal Hero

BUILD INTENT
Determine before doing anything:
- standalone: build only this skill, from scratch.
- add: add this to an existing project.
- replace: replace only the named section; leave everything else intact.
- combined: one piece of a multi-module build; ask for the order.
Determine the build intent from the user's request and the current project. Infer when
obvious. If the intent still cannot be inferred, ask one concise clarification before
editing.

PROJECT AUDIT
If a project already exists, inspect its files and structure before writing code.

Identify:
- existing sections
- existing interactions
- existing assets
- existing navigation or state logic
- existing mouse, touch, or input handlers
- where the hero belongs

Preserve working sections and modules unless the intent is replacement.
Use the smallest safe change needed for the selected build intent.
When adding or updating the hero, keep the existing project flow intact.

ASSET PREFLIGHT
Locate two uploaded images: a FRONT image (on top) and a REVEAL image (underneath).
If roles are ambiguous, choose by filename and state the mapping. Report each image's
filename, path, and size; confirm both decode. If either is missing, STOP and report
which one. Do not use a placeholder, a stock image, or an external URL.

IMPLEMENTATION
- If standalone, build a full-screen hero with no page scroll. If adding to an existing
  project, add or update only the hero section while preserving the existing page flow.
  If replacing, replace only the named hero or section. Two absolutely-positioned,
  object-fit:cover images stacked: bottom = REVEAL, top = FRONT.
- On mousemove, reveal the bottom image through the top via a radial-gradient
  mask-image on FRONT, centred on the cursor. Track the cursor into CSS variables
  (--reveal-x, --reveal-y) updated in a requestAnimationFrame throttle. On
  pointerleave, close the mask so FRONT is whole again.
- CSS mask only — no WebGL. Under prefers-reduced-motion, show FRONT static.
- object-fit: cover, with a commented contain option. Plain HTML/CSS/JS. No external
  URLs. No re-encoding.
- When adding to an existing project, integrate the reveal into the existing layout
  while keeping existing scroll, video, navigation, and scrub interactions working.

SUCCESS CRITERIA
- FRONT and REVEAL are wired correctly.
- The mask follows the cursor smoothly.
- The mask closes on pointerleave.
- Existing sections and modules remain intact unless the intent is replacement.
- Existing scroll, video, navigation, and scrub interactions still work after integration.
- The implementation uses the uploaded image files.
- Verify in the browser, then report:
  - file→role mapping
  - selected build intent
  - files changed
  - confirmation that the reveal works
