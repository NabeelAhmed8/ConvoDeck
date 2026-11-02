export type CardPlacement = "right" | "left" | "top" | "bottom" | "center";

export interface ICardPosition {
  top: number;
  left: number;
  placement: CardPlacement;
  arrowOffset: number; // percentage or px for arrow alignment
}

export function computeTourCardPosition(
  targetRect: DOMRect | null,
  cardWidth = 380,
  cardHeight = 270,
  preferredPlacement: CardPlacement = "right"
): ICardPosition {
  if (typeof window === "undefined") {
    return { top: 100, left: 100, placement: "center", arrowOffset: 50 };
  }

  const winW = window.innerWidth;
  const winH = window.innerHeight;
  const pad = 16;
  const spacing = 16;

  // Responsive fallback for small mobile screens
  if (!targetRect || winW < 768) {
    const mobileWidth = Math.min(cardWidth, winW - pad * 2);
    const left = Math.max(pad, (winW - mobileWidth) / 2);
    // On mobile, pin near the bottom above navigation/safe areas
    const top = Math.max(pad, winH - cardHeight - pad - 10);
    return {
      top,
      left,
      placement: "center",
      arrowOffset: 50,
    };
  }

  let placement = preferredPlacement;

  // 1. Placement: RIGHT of target (standard for sidebar items)
  if (placement === "right") {
    let left = targetRect.right + spacing;
    // If runs out of right room, flip to left
    if (left + cardWidth > winW - pad) {
      if (targetRect.left - cardWidth - spacing >= pad) {
        placement = "left";
        left = targetRect.left - cardWidth - spacing;
      } else {
        placement = "bottom";
      }
    }

    if (placement === "right" || placement === "left") {
      // Center vertically next to target
      const targetMidY = targetRect.top + targetRect.height / 2;
      let top = targetMidY - cardHeight / 2;

      // Keep within viewport bounds
      top = Math.max(pad, Math.min(top, winH - cardHeight - pad));

      // Calculate relative arrow position
      const arrowOffset = Math.max(
        24,
        Math.min(targetMidY - top, cardHeight - 24)
      );

      return { top, left, placement, arrowOffset };
    }
  }

  // 2. Placement: BOTTOM of target (standard for banner buttons)
  if (placement === "bottom") {
    let top = targetRect.bottom + spacing;
    // If runs out of bottom room, flip to top
    if (top + cardHeight > winH - pad) {
      if (targetRect.top - cardHeight - spacing >= pad) {
        placement = "top";
        top = targetRect.top - cardHeight - spacing;
      }
    }

    const targetMidX = targetRect.left + targetRect.width / 2;
    let left = targetMidX - cardWidth / 2;

    // Keep within horizontal bounds
    left = Math.max(pad, Math.min(left, winW - cardWidth - pad));

    const arrowOffset = Math.max(
      24,
      Math.min(targetMidX - left, cardWidth - 24)
    );

    return { top, left, placement, arrowOffset };
  }

  // Fallback centered
  const left = Math.max(pad, (winW - cardWidth) / 2);
  const top = Math.max(pad, (winH - cardHeight) / 2);
  return { top, left, placement: "center", arrowOffset: 50 };
}
