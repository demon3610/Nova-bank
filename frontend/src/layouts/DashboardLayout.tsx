import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useUiStore } from '@/store/uiStore';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout() {
  const { sidebarOpen } = useUiStore();

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <Sidebar />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={clsx(
          'pt-16 min-h-screen transition-all duration-300',
          sidebarOpen ? 'lg:ml-60' : 'lg:ml-16',
        )}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
}
