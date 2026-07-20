"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Wires Lenis smooth scrolling for the 2D landing page only (native
 * `scroll-behavior` stays `auto` globally — see globals.css — so the two
 * never fight). No-ops entirely under prefers-reduced-motion: Lenis is
 * simply never constructed, so the page falls back to plain native
 * scrolling with zero smoothing overhead.
 */
export function useLenis() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    });

    let raf = 0;
    function tick(time: number) {
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    function onAnchorClick(e: MouseEvent) {
      const target = (e.target as HTMLElement)?.closest("a[href^='#']");
      if (!target) return;
      const id = target.getAttribute("href")?.slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: -80 });
    }
    document.addEventListener("click", onAnchorClick);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);
}
