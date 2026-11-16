"use client";

import { type ReactNode, useEffect, useRef } from "react";

/** Reveal once; server-rendered content stays visible without JavaScript. */
export function HomeMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = root.current;
    if (!container || !("IntersectionObserver" in window)) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const elements = [
      ...container.querySelectorAll<HTMLElement>("[data-home-reveal]"),
    ];
    const reveal = (element: Element) =>
      element.removeAttribute("data-motion-pending");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.08 },
    );

    if (!preference.matches) {
      for (const element of elements) {
        if (element.getBoundingClientRect().top < window.innerHeight - 24)
          continue;
        element.setAttribute("data-motion-pending", "");
        observer.observe(element);
      }
    }
    const showAll = () => {
      if (!preference.matches) return;
      observer.disconnect();
      elements.forEach(reveal);
    };
    const showFocused = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      for (const element of elements) {
        if (element.contains(event.target)) {
          reveal(element);
          observer.unobserve(element);
        }
      }
    };
    preference.addEventListener("change", showAll);
    container.addEventListener("focusin", showFocused);
    return () => {
      observer.disconnect();
      elements.forEach(reveal);
      preference.removeEventListener("change", showAll);
      container.removeEventListener("focusin", showFocused);
    };
  }, []);

  return (
    <div
      ref={root}
      className="home-page relative flex flex-1 flex-col overflow-x-clip"
    >
      {children}
    </div>
  );
}
