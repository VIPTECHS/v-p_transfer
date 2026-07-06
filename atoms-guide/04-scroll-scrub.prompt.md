Skill: Scroll-Controlled Video Scrub

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
- existing scroll, wheel, touch, or keyboard handlers
- where this scroll-scrub section belongs

Preserve working sections and modules unless the intent is replacement.
Use the smallest safe change needed for the selected build intent.
When adding this scroll scrub, integrate it into the existing project flow instead of
replacing the page.

ASSET PREFLIGHT
Locate one uploaded video. Report its filename, path, size, duration, and dimensions;
confirm its metadata loads. If no video is uploaded, STOP and report it. Do not use a
placeholder, a stock clip, or an external URL.

IMPLEMENTATION
- If standalone, build a full-screen scroll-scrub page with a tall scroll container. If
  adding to an existing project, add this as a new scroll-scrub section in the requested
  location while preserving the existing page flow. If replacing, replace only the named
  section. The video is muted, playsInline, preload="auto", remains paused, and is
  displayed full-screen within this interaction.
- Map scroll progress to time continuously: progress = clamp(scrollTop /
  (scrollHeight - innerHeight), 0, 1); targetTime = progress * video.duration.
- This is continuous scroll-controlled seeking, not triggered playback. Scroll position
  controls the target frame; the video remains paused.
- Scroll down increases progress (forward); scroll up decreases it (backward).
- In a requestAnimationFrame loop ease the displayed time toward the target and set
  video.currentTime. The video remains paused throughout the interaction.
- Render <video> directly (no <canvas>), no re-encoding, no external URLs. object-fit:
  cover, with a commented contain option.
- Keep this separate from the scroll-triggered video section skill. That skill plays a
  transition after a scroll gesture; this skill continuously maps scroll progress to
  video.currentTime.
- Prioritize smoothness and quality. Drive every update from a single
  requestAnimationFrame loop; never write video.currentTime on the raw scroll/wheel event.
- Keep a targetTime and a displayed time. Scroll updates targetTime from scroll progress;
  each rAF frame eases the displayed time toward targetTime so the scroll-progress
  mapping stays smooth. Ease toward the target instead of jumping abruptly.
- Write video.currentTime at most once per frame. Avoid fighting the browser with many
  currentTime writes per frame, which causes visible jitter and black frames.
- Preload metadata and wait for the loadedmetadata event before reading video.duration;
  do not calculate targetTime until the duration is known.
- Keep the video muted, playsInline, and paused for the whole interaction: seek only,
  never call play(). No autoplay and no triggered playback.
- Use object-fit: cover by default (with a commented contain option) so frames fill the
  viewport with no letterboxing or flashes; avoid visible jitter and black frames.
- For best results the source video should use dense keyframes / scrub-friendly encoding
  (short GOP, faststart) so seeks land cleanly.
- Keep the interaction responsive on desktop: light per-frame math, no layout thrash, and
  no heavy work inside the scroll handler.

SUCCESS CRITERIA
- Scrolling seeks the video forward when scrolling down.
- Scrolling seeks the video backward when scrolling up.
- The video remains paused and does not autoplay.
- The scrub is continuous, with no beat snapping.
- Existing sections and modules remain intact unless the intent is replacement.
- Existing hero, reveal, scroll-video, mouse-scrub, navigation, and video interactions still work after integration.
- The implementation uses the uploaded video file.
- Verify in the browser, then report:
  - selected build intent
  - filename used
  - files changed
  - confirmation that scroll controls video.currentTime continuously
  - confirmation that this was not implemented as triggered playback
