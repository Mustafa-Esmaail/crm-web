import { createNavigation } from 'next-intl/navigation';

import { routing } from './routing';

// Locale-aware Link/useRouter/usePathname: hrefs stay locale-free and the prefix is added for us.
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
