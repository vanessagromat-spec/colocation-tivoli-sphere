import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  MessageSquare,
  LayoutDashboard,
  Bot,
  Users,
  FolderKanban,
  FileText,
  Settings,
  Menu,
  X,
  Cpu,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Tableau de bord', href: '/', icon: LayoutDashboard },
  { name: 'Chat IA', href: '/chat', icon: MessageSquare },
  { name: 'Agent Autonome', href: '/agent', icon: Bot },
  { name: 'CRM', href: '/crm', icon: Users },
  { name: 'Projets', href: '/projects', icon: FolderKanban },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Parametres', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-md bg-primary text-primary-foreground shadow-lg"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-screen',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
              <Cpu className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Bleue IA</h1>
              <p className="text-xs text-muted-foreground">Votre assistant</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <item.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-border">
            <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-muted">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">Modele local actif</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
