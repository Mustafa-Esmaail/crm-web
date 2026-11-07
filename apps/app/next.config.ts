import path from 'node:path';

import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts');

// Hostinger's Node.js hosting always builds Next.js as a standalone server (it replaces any `output`
// set here). CI checks the same build with NEXT_OUTPUT=standalone. Local builds stay normal, because
// standalone output needs symlink privileges on Windows.
const isStandalone = process.env.NEXT_OUTPUT === 'standalone';

const nextConfig: NextConfig = {
  // Workspace packages ship TypeScript source, so Next must compile them.
  transpilePackages: ['@crm/ui', '@crm/api-client'],
  // Monorepo: trace from the workspace root so packages/* end up in any standalone build, including
  // the one Hostinger makes.
  outputFileTracingRoot: path.join(__dirname, '../../'),
  ...(isStandalone && { output: 'standalone' }),
};

export default withNextIntl(nextConfig);
