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
  // Link-preview crawlers that do not run JavaScript get the title and Open Graph tags in <head>.
  // Next's default list plus TelegramBot, which it lacks.
  htmlLimitedBots:
    /[\w-]+-Google|Google-[\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight|TelegramBot/i,
};

export default withNextIntl(nextConfig);
