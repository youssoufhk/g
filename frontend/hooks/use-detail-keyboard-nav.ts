"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Wires J / K and [ / ] to previous / next detail links. Ignored when
 * focus is in an editable surface so typing is never hijacked.
 */
export function useDetailKeyboardNav(prevHref: string | null, nextHref: string | null) {
  const router = useRouter();
  useEffect(() => {
    function isEditable(el: EventTarget | null): boolean {
      const node = el as HTMLElement | null;
      if (!node) return false;
      const tag = node.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      if (node.isContentEditable) return true;
      return false;
    }
    function handler(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isEditable(e.target)) return;
      if ((e.key === "k" || e.key === "[") && prevHref) {
        e.preventDefault();
        router.push(prevHref);
      } else if ((e.key === "j" || e.key === "]") && nextHref) {
        e.preventDefault();
        router.push(nextHref);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prevHref, nextHref, router]);
}
