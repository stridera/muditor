import { Badge } from '@/components/ui/badge';
import { Shield, User, Hammer, Code, Crown, Star } from 'lucide-react';

type Role = 'PLAYER' | 'IMMORTAL' | 'BUILDER' | 'HEAD_BUILDER' | 'CODER' | 'GOD';

interface RoleBadgeProps {
  role: Role;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const roleConfig = {
  PLAYER: {
    label: 'Player',
    icon: User,
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  },
  IMMORTAL: {
    label: 'Immortal',
    icon: Star,
    variant: 'default' as const,
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  },
  BUILDER: {
    label: 'Builder',
    icon: Hammer,
    variant: 'default' as const,
    className: 'bg-green-100 text-green-700 hover:bg-green-200',
  },
  HEAD_BUILDER: {
    label: 'Head Builder',
    icon: Hammer,
    variant: 'default' as const,
    className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
  },
  CODER: {
    label: 'Coder',
    icon: Code,
    variant: 'default' as const,
    className: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
  },
  GOD: {
    label: 'God',
    icon: Crown,
    variant: 'default' as const,
    className: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
  },
};

export function RoleBadge({ role, showIcon = true, size = 'md' }: RoleBadgeProps) {
  const config = roleConfig[role];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  };

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${sizeClasses[size]} flex items-center gap-1.5 font-medium`}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </Badge>
  );
}
