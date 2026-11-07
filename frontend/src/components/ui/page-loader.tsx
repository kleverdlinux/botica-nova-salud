import React, { useState, useEffect } from "react";
import { RibbonFoldLoader } from "./ribbon-fold-loader";

export function PageLoader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 1600);

    const removeTimer = setTimeout(() => {
      setVisible(false);
    }, 2100);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center bg-background text-foreground transition-opacity duration-500 ease-in-out ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      <RibbonFoldLoader />
    </div>
  );
}

export default PageLoader;
