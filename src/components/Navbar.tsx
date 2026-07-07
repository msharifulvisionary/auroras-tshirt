import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { AnimatePresence, motion } from 'motion/react';

export function Navbar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdminMenuUnlocked, setIsAdminMenuUnlocked] = useState(
    sessionStorage.getItem('isAdminMenuUnlocked') === 'true'
  );

  const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';

  useEffect(() => {
    // Clear any legacy localStorage values to instantly hide the admin button for existing users
    if (localStorage.getItem('isAdminMenuUnlocked')) {
      localStorage.removeItem('isAdminMenuUnlocked');
    }

    const handleMenuChanged = () => {
      setIsAdminMenuUnlocked(sessionStorage.getItem('isAdminMenuUnlocked') === 'true');
    };

    window.addEventListener('admin-menu-unlocked-event', handleMenuChanged);
    // Also listen to general storage changes (e.g. logouts)
    window.addEventListener('storage', handleMenuChanged);

    return () => {
      window.removeEventListener('admin-menu-unlocked-event', handleMenuChanged);
      window.removeEventListener('storage', handleMenuChanged);
    };
  }, []);

  const navLinks = [
    { name: 'হোম', path: '/' },
    { name: 'আবেদন', path: '/apply' },
    { name: 'স্ট্যাটাস', path: '/track' }
  ];

  if (isAdminMenuUnlocked) {
    navLinks.push({
      name: isAdminLoggedIn ? 'ড্যাশবোর্ড' : 'এডমিন',
      path: isAdminLoggedIn ? '/admin/dashboard' : '/admin'
    });
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="w-full max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src="https://i.imgur.com/nIOAmb3.png" alt="Batch Logo" className="w-12 h-12 object-contain" />
          <div className="flex flex-col">
            <span className="font-display font-black text-slate-900 leading-tight text-lg tracking-tight uppercase">T-SHIRT PROGRAM 2026</span>
            <span className="text-xs font-bold text-blue-600 tracking-widest uppercase">Auroras-25</span>
          </div>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "text-sm font-bold tracking-wide transition-colors px-3 py-2 rounded-lg",
                location.pathname === link.path || (link.path === '/admin' && location.pathname.startsWith('/admin'))
                  ? "bg-blue-50 text-blue-700" 
                  : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Mobile Nav Toggle */}
        <button 
          className="md:hidden p-2 text-slate-600 hover:text-blue-600 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Nav Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.nav 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-slate-100 bg-white overflow-hidden"
          >
            <div className="flex flex-col p-4 space-y-2">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "block px-4 py-3 rounded-xl text-base font-bold transition-colors",
                    location.pathname === link.path || (link.path === '/admin' && location.pathname.startsWith('/admin'))
                      ? "bg-blue-50 text-blue-700" 
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
