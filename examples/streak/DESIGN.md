# DESIGN.md — Streak design brief

**Personality:** calm, earnest, tactile — a paper habit journal, not a SaaS dashboard.

**Typography:** Fraunces (display — headings, the big streak number) + system-ui for body.
Deliberately not the default sans: the streak number is the hero and gets a warm serif at 64px+.

**Palette:** warm paper `#FAF6EF` background · ink `#1F1B16` text · terracotta `#C4552D`
(the single accent: streak number, check-in button, active states) · sage `#6F7D5C` success
only · muted clay `#B8AB9C` for secondary text/dividers. Nothing else.

**Spacing/shape:** 8px scale; corners 6px max (no pill buttons); shadows replaced by 1px
ink-tint borders. Motion: one 200ms ease on check-in confirmation, nothing decorative.

**Never:** blue→purple gradients, glow/aurora effects, gray-card-grid dashboards, decorative
emoji, drop shadows, more than one accent color per screen, spinners longer than 400ms
(skeletons instead).

**Edge states are designed screens:**
- Dashboard empty (new user): illustration-free welcome, one line, the check-in button as the only CTA.
- Dashboard loading: skeleton of streak number + heatmap grid.
- Check-in error: plain-language inline message ("Couldn't save — you're offline. We'll retry.") with auto-retry.
- Magic-link expired: friendly re-request screen, one tap to resend.
