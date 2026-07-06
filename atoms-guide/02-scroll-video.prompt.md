Skill: Scroll-Triggered Video Section

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
- where this scroll-controlled video section belongs

Preserve working sections and modules unless the intent is replacement.
Use the smallest safe change needed for the selected build intent.
When adding this section, integrate it into the existing project flow instead of
replacing the page.

ASSET PREFLIGHT
Locate one uploaded video. Report its filename, path, and size; confirm its metadata
loads (duration and dimensions). If no video is uploaded, STOP and report it. Do not
use a placeholder, a stock clip, or an external URL.

IMPLEMENTATION
- If standalone, build a full-screen scroll-triggered video section. If adding to an
  existing project, add this as a new section in the requested location while preserving
  the existing page flow. If replacing, replace only the named section. The video is
  full-screen, muted, playsInline, preload="auto", and starts paused on the first frame.
- The first downward scroll, wheel, or touch gesture triggers the video to play from the
  current frame to the end.
- One downward gesture plays the entire video completely.
- While the video is playing, lock additional scroll/wheel/touch input so repeated
  gestures do not restart, scrub, skip, or interrupt playback.
- When the video reaches the end, pause it and keep it frozen on the final frame.
- After the video has completed, allow the page or experience to continue according to
  the project structure.
- Scroll progress is not mapped to video.currentTime. The scroll gesture is only a
  trigger to start playback.
- Render the <video> element directly. Use no canvas, no re-encoding, and no external
  URLs. Use object-fit: cover, with a commented contain option.

SUCCESS CRITERIA
- The video starts paused on the first frame.
- One downward scroll/wheel/touch gesture starts playback.
- The video plays completely to the end after that single gesture.
- The video pauses and remains frozen on the final frame.
- Extra scroll/wheel/touch input during playback does not restart, scrub, skip, or interrupt the video.
- Scroll progress is not mapped continuously to video.currentTime.
- Existing sections and modules remain intact unless the intent is replacement.
- Existing hero, reveal, scrub, navigation, and video interactions still work after integration.
- The implementation uses the uploaded video file.
- Verify in the browser, then report:
  - selected build intent
  - filename used
  - files changed
  - confirmation that one downward gesture plays the full video
  - confirmation that the video freezes on the final frame
  - confirmation that this is not scroll scrub
