/**
 * Stands in for the `server-only` package under Vitest.
 *
 * That package deliberately throws from its default entry so a client bundle
 * cannot import server code. Next swaps it for an empty module via the
 * `react-server` export condition; the test runner does not, so importing any
 * guarded module would fail. Aliasing it here (see vitest.config.ts) keeps the
 * guard meaningful in the app while leaving those modules testable.
 */
export {}
