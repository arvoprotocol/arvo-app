"use client";

import { useEffect } from "react";
import { initGSAP } from "@/lib/gsap";

export function useGSAP() {
  useEffect(() => {
    initGSAP();
  }, []);
}