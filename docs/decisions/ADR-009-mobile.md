# ADR-009: Mobile platform

**Status:** Accepted

## Decision

Progressive Web App (PWA) built from the same Next.js codebase. No React Native, no native iOS/Android.

Full spec: `specs/MOBILE_STRATEGY.md`.

## Rationale

- One codebase, one design system, one bug tracker.
- Instant updates, no app store review.
- PWA capabilities cover our needs: installability, push, camera, offline read, background sync.
- iOS PWA support mature enough. Web Push on iOS requires iOS 16.4+ AND the app must be installed as a PWA (added to Home Screen). Without install, no push. The app detects iOS version and install state; if Web Push is unavailable, it falls back to in-app notifications only (user must open the PWA to see them) and shows a one-time banner "Install Gamma to your Home Screen for push notifications." Tested on iOS 15 (no push, in-app only), iOS 16.4 installed (push works), iOS 16.4 browser (no push), Android (push works).
- No app store fees; distribution via URL + QR code.
- Native joins the roadmap only if a paying customer blocks on iOS-specific features.

## Rejected

- **React Native:** forks the UI layer, two implementations to maintain.
- **Native iOS + Android:** 3x the work for solo founder.
- **Flutter:** another ecosystem, separate from web.

## Consequences

- Shell and content patterns must be responsive (already required).
- Excellent iOS PWA support required. Tested on real devices.
- App store discovery unavailable. URL/QR is the distribution channel.
- Web Push used for notifications (iOS 16.4+ installed as PWA; Android all supported versions).
- API is language-agnostic REST, so a native client can be added later without backend changes.
- **Offline scope is two-tier:**
  1. **Write offline**: timesheet entry form uses IndexedDB queue with local_id + version=-1 sentinels, syncs via POST /api/v1/timesheets/sync-offline on reconnect (see `specs/MOBILE_STRATEGY.md`).
  2. **Read offline**: service worker caches the last 30 days of viewed GET /api/v1/* responses via `Cache-First` with `stale-while-revalidate`. Offline pages render with an "Offline" badge; search and write actions other than timesheets are disabled.

  Cache cap 50 MB per origin, LRU eviction, busts on version upgrade or sign-out.
