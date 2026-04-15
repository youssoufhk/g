import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./lib/i18n.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // typedRoutes requires every Link href to be a statically known route.
  // Our sidebar + bottom-nav pass href from a registry and locale-prefix
  // at runtime, so typed routes rejects them. Re-enable after Phase 5
  // when every route exists under app/ and the registry is typed.
};

export default withNextIntl(nextConfig);
