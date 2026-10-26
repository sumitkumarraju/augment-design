import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const Logo = () => (
  <svg width="22" height="22" viewBox="0 0 256 256" fill="white" xmlns="http://www.w3.org/2000/svg">
    <path d="M 256 64 L 256 128 L 192.5 128 L 160 95 L 128 64 L 96 95 L 63.5 128 L 64 128 L 128 192 L 128 256 L 64.5 256 L 32 223 L 0 192 L 0 64 L 64 0 L 192 0 Z M 256 192 L 256 256 L 192.5 256 L 160 223 L 128 192 L 128 128 L 192 128 Z" />
  </svg>
);

const navLinks = [
  { name: 'Module', href: '#module', active: true },
  { name: 'Workspace', href: '#workspace' },
  { name: 'Technology', href: '#technology' },
  { name: 'Product', href: '#augment-one' },
  { name: 'Case Records', href: '#case-records' },
  { name: 'Biotech', href: '#biotech' },
  { name: 'Tiers', href: '#tiers' },
  { name: 'Live Demo', href: '#live-demo' },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between md:justify-center p-4 sm:p-5">
        {/* Desktop */}
        <div className="hidden md:flex bg-black/60 backdrop-blur-md rounded-full pl-3 pr-2 py-2 items-center gap-1 nav-drop" style={{ animationDelay: '0.1s' }}>
          <a href="#module" aria-label="AUGMENT home" className="mr-4 flex items-center gap-2">
            <Logo />
            <span className="text-[10px] tracking-[0.22em] text-white/80">AUGMENT</span>
          </a>
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${
                link.active ? 'text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {link.name}
            </a>
          ))}
          <a
            href="#connect"
            className="bg-white text-gray-900 text-sm font-semibold px-5 py-1.5 rounded-full hover:bg-gray-100 transition-colors ml-1"
          >
            Connect
          </a>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden w-full justify-between items-center nav-drop" style={{ animationDelay: '0.1s' }}>
          <a href="#module" aria-label="AUGMENT home" className="bg-black/60 backdrop-blur-md rounded-full p-2.5 flex items-center gap-2">
            <Logo />
            <span className="text-[10px] tracking-[0.18em] text-white/80 pr-1">AUGMENT</span>
          </a>
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            className="bg-black/60 backdrop-blur-md rounded-full p-2.5 text-white"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="fixed top-0 left-0 right-0 z-40 pt-20 pb-6 px-5 bg-white shadow-lg md:hidden flex flex-col">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="py-3 border-b border-gray-100 text-gray-800 font-medium text-lg"
            >
              {link.name}
            </a>
          ))}
          <a
            href="#connect"
            onClick={() => setIsOpen(false)}
            className="mt-6 bg-gray-900 text-white text-center font-semibold py-3 rounded-full"
          >
            Connect
          </a>
        </div>
      )}
    </>
  );
};
