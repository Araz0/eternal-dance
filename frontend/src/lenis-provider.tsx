"use client";

import gsap from "gsap";
import ReactLenis, { LenisRef, useLenis } from "lenis/react";
import { useLocation } from 'react-router-dom';
import { ReactNode, useEffect, useRef } from "react";

const LenisProvider = ({ children }: { children: ReactNode }) => {
  const lenisRef = useRef<LenisRef | null>(null);
  let location = useLocation();

  const lenis = useLenis();

  useEffect(() => {
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);

    return () => gsap.ticker.remove(update);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      lenis?.scrollTo("top", {
        duration: 1,
      });
    }, 100);
  }, [lenis]);

  useEffect(() => {
    lenis?.scrollTo("top", {
      duration: 1,
    });
  }, [location.pathname]);

  return (
    <ReactLenis
      root
      options={{
        autoRaf: false,
        lerp: 0.05,
        touchMultiplier: 0.5,
      }}
      ref={lenisRef}
    >
      {children}
    </ReactLenis>
  );
};

export default LenisProvider;
