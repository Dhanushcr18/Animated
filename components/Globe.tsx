'use client';

import { motion } from 'framer-motion';

export default function Globe() {
  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Gradient fade from section above */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#050505] to-transparent z-20 pointer-events-none" />

      {/* Ambient background — deep space grid */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse 100% 80% at 50% 60%, #0a1628 0%, #050505 70%)',
        }}
      />

      {/* Globe visual — animated SVG rings */}
      <div className="absolute inset-0 flex items-center justify-center z-0 overflow-hidden">
        <GlobeGraphic />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 z-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Gradient fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#050505] to-transparent z-20 pointer-events-none" />

      {/* Content */}
      <div className="relative z-30 flex flex-col items-center text-center px-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-[var(--gold)] tracking-[0.4em] text-xs font-light mb-6 flex items-center gap-3"
        >
          <span className="gold-line" />
          03 — GLOBAL REACH
          <span className="gold-line" />
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="font-display text-6xl md:text-8xl xl:text-[7rem] font-light text-white leading-none mb-6"
        >
          THE WORLD<br />
          <span className="shimmer-text italic">IS YOURS.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-white/40 text-sm md:text-base font-light tracking-wide max-w-xl leading-relaxed mb-14"
        >
          From Monaco to Mumbai. Tokyo to Toronto.<br />
          Every destination, on your schedule.
        </motion.p>

        <motion.button
          id="reserve-btn"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02, backgroundColor: '#FAFAFA', color: '#050505' }}
          transition={{ duration: 0.8, delay: 0.7 }}
          viewport={{ once: true }}
          className="border border-white/30 text-white text-xs tracking-[0.4em] px-12 py-5 transition-all duration-500 hover:border-white cursor-pointer"
          style={{ background: 'transparent' }}
        >
          RESERVE YOUR FLIGHT
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          viewport={{ once: true }}
          className="flex gap-8 mt-16 text-white/20 text-[10px] tracking-[0.3em]"
        >
          <span>PRIVACY POLICY</span>
          <span className="text-white/10">·</span>
          <span>TERMS OF SERVICE</span>
          <span className="text-white/10">·</span>
          <span>© 2026 JESKO JETS</span>
        </motion.div>
      </div>
    </section>
  );
}

function GlobeGraphic() {
  return (
    <div className="relative w-[700px] h-[700px] md:w-[900px] md:h-[900px] opacity-30">
      {/* Outer ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 rounded-full border border-white/10"
        style={{ borderStyle: 'dashed' }}
      />
      {/* Mid ring tilted */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-[60px] rounded-full border border-[var(--gold)]/20"
        style={{ transform: 'rotateX(70deg)', borderStyle: 'dashed' }}
      />
      {/* Inner solid ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-[120px] rounded-full border border-white/5"
      />
      {/* Core glow */}
      <div
        className="absolute inset-[150px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, rgba(10,22,40,0.8) 70%)',
          boxShadow: '0 0 120px 40px rgba(201,168,76,0.06)',
        }}
      />
      {/* Dots on orbit */}
      {[0, 90, 180, 270].map((deg) => (
        <motion.div
          key={deg}
          className="absolute w-2 h-2 rounded-full bg-[var(--gold)]/60"
          style={{
            top: '50%',
            left: '50%',
            transformOrigin: '0 0',
            transform: `rotate(${deg}deg) translateX(${340}px) translateY(-4px)`,
          }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, delay: deg / 90 }}
        />
      ))}
    </div>
  );
}
