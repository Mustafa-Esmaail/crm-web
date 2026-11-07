import path from 'node:path';

import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts');

// The deploy workflow builds with NEXT_OUTPUT=standalone: a self-contained server.js plus only the
// node_modules it needs, which is what gets copied to the VPS. Local builds stay normal (standalone
// output needs symlink privileges on Windows).
const isStandalone = process.env.NEXT_OUTPUT === 'standalone';

const nextConfig: NextConfig = {
  // Workspace packages ship TypeScript source, so Next must compile them.
  transpilePackages: ['@crm/ui', '@crm/api-client'],
  ...(isStandalone && {
    output: 'standalone',
    // Monorepo: trace from the workspace root so packages/* are included in the output.
    outputFileTracingRoot: path.join(__dirname, '../../'),
  }),
};

export default withNextIntl(nextConfig);
