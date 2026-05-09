# Campus Fit Quest Project Instructions

## Delivery Goal

Build the highest-impact interview demo possible within a strict 20-hour execution window.

The demo must prioritize:
- A clickable online experience that opens directly to the product demo.
- A mobile-first Web presentation matching the PRD's 390x844 phone experience.
- Complete core product loop: login/privacy, daily task, energy reward, campus run, challenge, benefits, planet profile, settings/compliance.
- Strong portfolio value over backend completeness.
- Reliable deployment and GitHub synchronization.

## Scope Priority

P0:
- Phone simulator shell and mobile full-screen adaptation.
- Five bottom tabs.
- Login page and first-launch privacy modal.
- Today page with mode switch, task completion feedback, localStorage persistence.
- Campus run flow with route, simulated checkpoints, completion reward.
- Challenge page with four challenge types.
- Benefits page with interest analysis, claim flow, mock redemption code.
- Planet page with weekly comparison, records, badge wall.
- Settings page with compliance architecture, permission center, device management, account cancellation flow.

P1:
- Offline simulation banner.
- Push preview center.
- User agreement and privacy policy pages.
- Data reset for interview reviewers.
- README with demo link, screenshots section, product/tech highlights.

P2:
- Extra polish only after P0/P1 are stable.

## Engineering Constraints

- Prefer a self-contained static web app if dependency installation or network access blocks React/Vite setup.
- Do not sacrifice demo availability for framework purity.
- Store demo state in localStorage.
- Keep user-facing copy aligned with the product documents' warm, campus, game-like tone.
- Avoid irreversible or destructive git operations unless explicitly requested.

## Known Initial Risk

The initial folder contains only `PRODUCT.md` and `TECH.md`; it is not a Git repository and has no remote configured. GitHub sync and public demo deployment may require GitHub authentication, a remote repository URL, or approval for network operations.
