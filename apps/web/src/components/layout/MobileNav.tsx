'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  Calendar,
  Users,
  Car,
  Wrench,
  Package,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/cn';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const mainNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/orders', label: 'Ordens de Serviço', icon: ClipboardList },
  { href: '/dashboard/scheduling', label: 'Agendamentos', icon: Calendar },
  { href: '/dashboard/customers', label: 'Clientes', icon: Users },
  { href: '/dashboard/vehicles', label: 'Veículos', icon: Car },
];

const catalogNavItems: NavItem[] = [
  { href: '/dashboard/services', label: 'Serviços', icon: Wrench },
  { href: '/dashboard/products', label: 'Produtos', icon: Package },
];

const settingsNavItems: NavItem[] = [
  { href: '/dashboard/settings', label: 'Configurações', icon: Settings },
];

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="border-b border-border px-6 py-4">
          <SheetTitle className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">F</span>
            </div>
            <span className="text-lg font-semibold">Filmtech OS</span>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <NavSection items={mainNavItems} pathname={pathname} onClose={onClose} />

          <Separator className="my-4" />

          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Catálogo
          </p>
          <NavSection items={catalogNavItems} pathname={pathname} onClose={onClose} />

          <Separator className="my-4" />

          <NavSection items={settingsNavItems} pathname={pathname} onClose={onClose} />
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function NavSection({
  items,
  pathname,
  onClose,
}: {
  items: NavItem[];
  pathname: string;
  onClose: () => void;
}) {
  return (
    <div className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href ||
          (item.href !== '/dashboard' && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all',
              'hover:bg-accent hover:text-accent-foreground',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
