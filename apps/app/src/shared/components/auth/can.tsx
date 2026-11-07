'use client';

import type { ReactNode } from 'react';

import { useCan } from '@/shared/hooks/use-can';

interface CanProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({ permission, children, fallback = null }: CanProps) {
  return useCan(permission) ? children : fallback;
}
