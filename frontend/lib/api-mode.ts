/**
 * Single source of truth for "is the frontend wired to the real
 * backend, or is it running on the in-process mock data in
 * `lib/mock-data.ts`?"
 *
 * Controlled by the NEXT_PUBLIC_USE_API env var. Default is "0"
 * (mock) so `npm run dev` works standalone without a running
 * backend. Set NEXT_PUBLIC_USE_API=1 in `.env.local` (or the
 * deploy env) to flip every feature hook onto `apiFetch(...)`.
 *
 * Feature hooks (`features/<name>/use-*.ts`) read this flag and
 * pick between:
 *   - the mock arm: filter + slice a seed list from mock-data.ts
 *   - the live arm: call apiFetch + run a backend-to-frontend
 *     shape adapter
 *
 * Keeping both arms behind one flag means:
 *   1. a single grep shows every feature not yet wired (look for
 *      `USE_API ? ... : ...` vs just the mock arm),
 *   2. dev ergonomics stay intact (no backend required to run
 *      the UI),
 *   3. production turns on one env var and gets live data with
 *      no code change.
 */
export const USE_API: boolean = process.env.NEXT_PUBLIC_USE_API === "1";
