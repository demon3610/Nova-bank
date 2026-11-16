import { Menu, Search, Building2 } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import NotificationBell from './NotificationBell';
import UserDropdown from './UserDropdown';

export default function Navbar() {
  const { sidebarOpen, toggleSidebar } = useUiStore();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface-card border-b border-surface-border z-50">
      <div className="flex items-center h-full px-4 lg:px-6">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-button hover:bg-surface transition-colors mr-3 lg:mr-4"
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <Menu className="w-5 h-5 text-text-secondary" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-800 flex items-center justify-center">
            <Building2 className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-lg font-bold text-primary-800 hidden sm:block">
            Nova<span className="text-primary-500">Bank</span>
          </span>
        </div>

        <div className="flex-1 flex justify-center px-4 lg:px-8">
          <div className="relative w-full max-w-md hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search accounts, transactions..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-surface border border-surface-border rounded-button text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <NotificationBell />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
