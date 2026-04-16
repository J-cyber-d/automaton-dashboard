'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Activity,
  Wallet,
  Brain,
  Ghost,
  HeartPulse,
  Users,
  Shield,
  MessageSquare,
  Settings,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Activity', href: '/activity', icon: Activity },
  { name: 'Financial', href: '/financial', icon: Wallet },
  { name: 'Memory', href: '/memory', icon: Brain },
  { name: 'Soul', href: '/soul', icon: Ghost },
  { name: 'Heartbeat', href: '/heartbeat', icon: HeartPulse },
  { name: 'Children', href: '/children', icon: Users },
  { name: 'Security', href: '/security', icon: Shield },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
];

function AgentStatus() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="relative">
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Ghost className="h-4 w-4 text-primary" />
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-tier-high border-2 border-sidebar" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium text-sidebar-foreground truncate">Agent</span>
        <span className="text-xs text-sidebar-foreground/60">Online</span>
      </div>
    </div>
  );
}

function MobileSidebar() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[260px] bg-sidebar p-0">
        <div className="flex h-full flex-col">
          <div className="border-b border-sidebar-border p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Ghost className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sidebar-foreground">Automaton</span>
            </div>
          </div>
          <nav className="flex-1 overflow-auto p-2">
            <ul className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="border-t border-sidebar-border p-4">
            <AgentStatus />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 h-screen flex-col bg-sidebar border-r border-sidebar-border sticky top-0">
      {/* Header */}
      <div className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Ghost className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sidebar-foreground">Automaton</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-auto p-2">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer - Agent Status */}
      <div className="border-t border-sidebar-border p-2">
        <AgentStatus />
      </div>
    </aside>
  );
}

export function AppSidebar() {
  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <MobileSidebar />
      </div>

      {/* Desktop Sidebar */}
      <DesktopSidebar />
    </>
  );
}
