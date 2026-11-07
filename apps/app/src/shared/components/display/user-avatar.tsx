import { cn } from '@crm/ui';

import { avatarColorVar, getInitials } from './avatar-utils';

const SIZE_CLASSES = {
  sm: 'size-8 text-caption',
  md: 'size-10 text-small',
  lg: 'size-14 text-card-title',
  xl: 'size-24 text-title',
} as const;

interface UserAvatarProps {
  id: number;
  name: string;
  src?: string | null;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}

export function UserAvatar({ id, name, src, size = 'md', className }: UserAvatarProps) {
  const base = cn(
    'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-white select-none',
    SIZE_CLASSES[size],
    className,
  );

  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- avatar hosts are not known at build time
    return <img src={src} alt={name} className={cn(base, 'object-cover')} />;
  }

  return (
    <span className={base} style={{ backgroundColor: avatarColorVar(id) }} aria-label={name}>
      {getInitials(name)}
    </span>
  );
}
