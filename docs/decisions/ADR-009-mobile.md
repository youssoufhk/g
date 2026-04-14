# ADR-009: Mobile platform

**Status:** Accepted

## Decision

Progressive Web App (PWA) built from the same Next.js codebase. No React Native, no native iOS/Android.

Full spec: `specs/MOBILE_STRATEGY.md`.

## Rationale

- One codebase, one design system, one bug tracker.
- Instant updates, no app store review.
- PWA capabilities cover our needs: installability, push, camera, offline read, background sync.
- iOS PWA support mature enough (iOS 16.4+ has web push).
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
- Web Push used for notifications (iOS 16.4+).
- API is language-agnostic REST, so a native client can be added later without backend changes.
