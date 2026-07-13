"use client";

import { useEffect, useRef } from "react";
import { useSessionUiStore } from "@/src/lib/store/useSessionUiStore";

/**
 * Design spec §4.5: the mobile bottom tab bar hides on scroll-down and
 * reappears on scroll-up. Drives the shared `bottomNavVisible` UI state so
 * the nav can translate itself out of view. A small threshold avoids
 * flicker; near the top the bar always shows.
 */
export function useHideOnScroll(threshold = 8) {
  const setVisible = useSessionUiStore((s) => s.setBottomNavVisible);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    function onScroll() {
      const y = window.scrollY;
      const delta = y - lastY.current;
      if (y < 64) {
        setVisible(true);
      } else if (Math.abs(delta) > threshold) {
        setVisible(delta < 0); // scrolling up → show, down → hide
      }
      lastY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      setVisible(true); // reset on unmount so other surfaces start visible
    };
  }, [setVisible, threshold]);
}
