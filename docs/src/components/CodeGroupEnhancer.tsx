"use client";

import type React from "react";
import { useEffect } from "react";

export function CodeGroupEnhancer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void import("rehype-code-group/client");
  }, []);

  return <>{children}</>;
}
