import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-surface flex">
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700" />

        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-20 left-10 w-72 h-72 border border-white rounded-full" />
          <div className="absolute bottom-20 right-10 w-96 h-96 border border-white rounded-full" />
          <div className="absolute top-1/3 right-1/4 w-48 h-48 border border-white rounded-full" />
        </div>

        <div className="relative flex flex-col justify-between p-12 xl:p-16 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <Building2 className="w-5.5 h-5.5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              Nova<span className="text-primary-200">Bank</span>
            </span>
          </div>

          <div className="max-w-md">
            <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4">
              Enterprise Digital Banking
            </h1>
            <p className="text-base xl:text-lg text-primary-100/80 leading-relaxed">
              Secure, intelligent banking solutions for modern enterprises. 
              Manage your finances with confidence.
            </p>

            <div className="mt-10 space-y-4">
              {[
                { stat: '$2B+', label: 'Transactions Processed' },
                { stat: '500+', label: 'Enterprise Clients' },
                { stat: '99.99%', label: 'Platform Uptime' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-300" />
                  <div>
                    <span className="text-white font-semibold">{item.stat}</span>
                    <span className="text-primary-200/70 ml-2 text-sm">{item.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-primary-200/50">
            &copy; {new Date().getFullYear()} NovaBank. All rights reserved.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-lg bg-primary-800 flex items-center justify-center">
              <Building2 className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold text-primary-800">
              Nova<span className="text-primary-500">Bank</span>
            </span>
          </div>

          <div className="bg-white border border-surface-border rounded-card shadow-card p-6 sm:p-8">
            <Outlet />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
