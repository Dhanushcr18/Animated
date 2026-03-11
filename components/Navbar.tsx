'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';

const NAV_LINKS = [
  { label: 'FLEET',      href: '#fleet' },
  { label: 'ROUTES',     href: '#routes' },
  { label: 'MEMBERSHIP', href: '#membership' },
  { label: 'RESERVE',    href: '#reserve', cta: true },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  // Background blur kicks in after 60px
  useEffect(() => {
    const unsub = scrollY.on('change', (v) => setScrolled(v > 60));
    return unsub;
  }, [scrollY]);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? 'rgba(5,5,5,0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(28px) saturate(200%)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(201,168,76,0.14)' : '1px solid transparent',
        WebkitBackdropFilter: scrolled ? 'blur(28px) saturate(200%)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-8 md:px-10 flex items-center justify-between h-18">

        {/* Logo */}
        <a href="/" className="flex items-center gap-3 group select-none">
          <span className="w-8 h-8 rounded-full border border-(--gold)/40 flex items-center justify-center
            text-(--gold) text-[11px] font-light tracking-wide
            group-hover:bg-(--gold)/10 group-hover:border-(--gold)
            transition-all duration-400 shrink-0">
            J
          </span>
          <span className="text-white text-[11px] tracking-[0.45em] font-light transition-colors duration-300 group-hover:text-(--gold)">
            JESKO JETS
          </span>
        </a>

        {/* Desktop nav — non-CTA links in frosted pill + gold CTA */}
        <nav className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-1 rounded-full px-2 py-1"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {NAV_LINKS.filter(l => !l.cta).map(link => (
              <NavLink key={link.label} href={link.href} label={link.label} />
            ))}
          </div>
          {NAV_LINKS.filter(l => l.cta).map(link => (
            <a
              key={link.label}
              href={link.href}
              className="text-[#050505] text-[10px] tracking-[0.35em] px-7 py-2.5 font-medium rounded-full
                transition-all duration-300
                hover:shadow-[0_0_28px_rgba(201,168,76,0.45)] hover:scale-[1.03]"
              style={{ background: 'linear-gradient(135deg, var(--gold-bright), var(--gold))' }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          id="nav-menu-toggle"
          onClick={() => setMenuOpen((o) => !o)}
          className="md:hidden flex flex-col gap-1.25 p-2 cursor-pointer"
          aria-label="Toggle menu"
        >
          <motion.span
            animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
            className="block w-5 h-px bg-white origin-center transition-colors"
          />
          <motion.span
            animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
            className="block w-5 h-px bg-white"
          />
          <motion.span
            animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
            className="block w-5 h-px bg-white origin-center"
          />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden border-t border-white/5"
            style={{ background: 'rgba(5,5,5,0.92)', backdropFilter: 'blur(20px)' }}
          >
            <nav className="flex flex-col px-8 py-6 gap-5">
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={`text-[10px] tracking-[0.35em] font-light transition-colors duration-300 ${
                    link.cta
                      ? 'text-(--gold) border-b border-(--gold)/30 pb-4'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {link.label}
                </motion.a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative px-4 py-1.5 text-white/55 hover:text-white text-[10px] tracking-[0.3em] font-light
        transition-colors duration-300 rounded-full hover:bg-white/6"
    >
      {label}
      <motion.span
        className="absolute bottom-1 left-4 right-4 h-px bg-(--gold) origin-left"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      />
    </a>
  );
}
