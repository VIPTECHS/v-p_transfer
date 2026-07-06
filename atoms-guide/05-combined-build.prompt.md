Skill: Combined Build / Finale

BUILD INTENT
This skill assembles existing modules or creates the missing pieces needed for a combined site.

Determine the build intent from the user's request and the current project. Infer when obvious.

Supported intents:
- assemble existing modules: connect modules that already exist in the project
- create missing modules: build only the modules that are missing
- add assembly to existing project: add the combined flow while preserving existing work
- replace a specific section: replace only the named section
- custom order: assemble modules in the user's requested order

If the order is not specified, ask one concise clarification:
"What order should the sections appear in?"

If the user has no preference, use:
image reveal → scroll-triggered video section → mouse scrub

PROJECT AUDIT
If a project already exists, inspect its files and structure before writing code.

Identify:
- existing sections
- existing modules
- existing assets
- existing navigation or state logic
- existing scroll, wheel, mouse, touch, or keyboard handlers
- whether image reveal already exists
- whether scroll-triggered video section already exists
- whether mouse scrub already exists
- whether scroll scrub already exists
- where the combined flow should begin and end

Preserve working sections and modules unless the intent is replacement.
Reuse existing modules when they work.
Create only the missing modules needed for the requested combined flow.
Use the smallest safe change needed for the selected build intent.

ASSET PREFLIGHT
Map uploaded files to the roles required by the selected section order.

Possible roles:
- hero-front image
- hero-reveal image
- scroll video
- mouse-scrub video
- scroll-scrub video

Report each matched file's filename, path, and size.
For images, confirm decode.
For videos, confirm metadata loads.

If a role is required by the selected order and no matching uploaded file or existing
project asset exists, stop and report which role is missing.

Use existing project assets when they are already correctly wired.
Use uploaded assets for new or replaced modules.
State the final file→role mapping before implementation.

IMPLEMENTATION
Assemble the combined experience in the selected order.

Use these module rules:
- Image reveal:
  uses hero-front + hero-reveal.
  Cursor reveals the hidden image through a soft CSS mask.
- Scroll-triggered video section:
  uses the scroll video.
  One downward scroll, wheel, or touch gesture plays the full video from the first frame to the final frame.
  While the video plays, input is locked so repeated gestures do not restart, scrub, skip, or interrupt playback.
  When the video reaches the end, it pauses and remains frozen on the final frame.
  Scroll progress is not bound to video.currentTime.
  This is triggered full playback, not scroll scrub.
- Mouse scrub:
  uses the mouse-scrub video.
  Mouse X controls video.currentTime continuously.
  The video remains paused.
- Scroll scrub:
  uses the scroll-scrub video.
  Scroll progress controls video.currentTime continuously.
  The video remains paused.
  Include this only if the selected order includes a scroll-scrub section.

For existing modules:
- connect and sequence them
- preserve their working implementation
- merge navigation/state/input logic carefully

For missing modules:
- build only the missing module
- integrate it into the selected order
- preserve existing project flow

Finale / transition:
If the selected order needs a final reveal, promote the real final section/footer to a
fixed full-viewport reveal layer and slide the previous layer up to reveal it.
Keep this optional and only apply it when it fits the selected order.
Support reverse navigation through the assembled flow.
Keep transitions stable and avoid document jump.

SUCCESS CRITERIA
- The selected section order is implemented.
- Existing working modules remain intact unless the intent is replacement.
- Missing modules are created only when needed.
- Uploaded and existing assets are mapped correctly.
- Scroll-triggered video section plays the full video after one downward gesture, freezes on the final frame, and does not scrub.
- Mouse scrub uses mouse X to control video.currentTime.
- Scroll scrub, if included, uses scroll progress to control video.currentTime.
- Forward navigation works.
- Reverse navigation works.
- The document does not jump during transitions.
- Verify in the browser, then report:
  - selected build intent
  - selected section order
  - file→role mapping
  - existing modules reused
  - missing modules created
  - files changed
  - confirmation that forward and reverse navigation work
