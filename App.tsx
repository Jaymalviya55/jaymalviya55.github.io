
import React, { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import Lenis from 'lenis';
import { useScrollStore } from './store/useScrollStore';
import { useThemeStore } from './store/useThemeStore';
import { ParticleSystem } from './canvas/ParticleSystem';
import { Overlay } from './components/Overlay';
import { FloatingNav } from './components/FloatingNav';
import { STATE_COUNT } from './types';

const App: React.FC = () => {
  const setScrollProgress = useScrollStore((state) => state.setScrollProgress);
  const setMousePosition = useScrollStore((state) => state.setMousePosition);
  const { theme } = useThemeStore();
  const lenisRef = useRef<Lenis | null>(null);
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL 
      ? `${import.meta.env.VITE_API_URL}/api/pageview`
      : `http://${window.location.hostname}:3000/api/pageview`;
      
    fetch(apiUrl, { method: 'POST' })
      .then(res => res.json())
      .then(data => setViews(data.views))
      .catch(err => console.error("Could not record page view", err));
  }, []);

  // Lenis & Scroll Handling
  useEffect(() => {
    // PREVENT BROWSER INTERFERENCE
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    const lenis = new Lenis({
      duration: 1.5,
      smoothWheel: true,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    lenisRef.current = lenis;

    lenis.on('scroll', ({ scroll, limit }) => {
      const progress = limit > 0 ? scroll / limit : 0;
      setScrollProgress(Math.max(0, Math.min(1, progress)));
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      cancelAnimationFrame(rafId);
      lenisRef.current = null;
    };
  }, []);

  // Mouse Handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMousePosition(x, y);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [setMousePosition]);

  // Navigation Handler
  const scrollToSection = (index: number) => {
    if (!lenisRef.current) return;
    const limit = lenisRef.current.limit;
    const targetProgress = index / (STATE_COUNT - 1);
    const targetScroll = targetProgress * limit;

    lenisRef.current.scrollTo(targetScroll, {
      duration: 2.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
  };

  return (
    // Apply 'dark' class conditionally based on store. 
    // Tailwind's `darkMode: 'class'` will look for this.
    <div className={`${theme} relative w-full min-h-screen`}>
      {/* Background Layer - transitions color smoothly */}
      <div className="fixed inset-0 bg-bg-light dark:bg-bg-dark transition-colors duration-700 z-[-1]" />

      {/* Navigation Layer */}
      <FloatingNav onNavigate={scrollToSection} />

      {/* 3D Scene Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas
          camera={{ position: [0, 0, 12], fov: 35 }}
          dpr={[1, 2]}
          gl={{ antialias: false, alpha: true }}
        >
          {/* 3D Background color must match HTML background for blending */}
          {/* We can handle this inside ParticleSystem or via a reactive color component */}
          <ParticleSystem />
        </Canvas>
      </div>

      {/* Fixed Overlays (Text Content) */}
      <Overlay />

      {/* Page View Counter Overlay */}
      {views !== null && (
        <div className="fixed bottom-4 left-4 z-50 pointer-events-none">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 text-slate-300 px-4 py-2 rounded-full font-mono text-xs flex items-center gap-2 shadow-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Total Visitors: <span className="text-white font-bold">{views}</span>
          </div>
        </div>
      )}

      {/* Height Spacer */}
      <div style={{ height: '800vh' }}></div>
    </div>
  );
};

export default App;
