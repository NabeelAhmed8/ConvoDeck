/**
 * tourElementFinder
 * Single-responsibility utility for finding the currently active and visible
 * tour target element across responsive mobile drawers and desktop sidebars.
 */

export function findVisibleTourElement(targetId: string): HTMLElement | null {
  if (typeof document === "undefined" || !targetId) {
    return null;
  }

  // Look for elements with either matching id or data-tour-id attribute
  const elements = Array.from(
    document.querySelectorAll<HTMLElement>(
      `#${targetId}, [id="${targetId}"], [data-tour-id="${targetId}"]`
    )
  );

  if (elements.length === 0) {
    return null;
  }

  // Find the element that is actually rendered and visible in the current viewport
  for (const el of elements) {
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const style = window.getComputedStyle(el);
      if (style.display !== "none" && style.visibility !== "hidden") {
        return el;
      }
    }
  }

  // Fallback to the first matching element if none has non-zero rect yet (e.g. during transition)
  return elements[0] || null;
}

