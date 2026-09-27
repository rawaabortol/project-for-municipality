import { useEffect, useRef } from 'react';

interface UseDismissOptions {
  isOpen: boolean;
  onDismiss: () => void;
  closeOnOutsideClick?: boolean;
  closeOnBlur?: boolean;
  closeOnEscape?: boolean;
  ignoreRefs?: React.RefObject<HTMLElement | null>[];
}

/**
 * Custom hook to automatically dismiss/close any component (div, menu, popover, modal)
 * when:
 * 1. Focus leaves the component (blur / focusout).
 * 2. User clicks or taps outside the component (mousedown / touchstart).
 * 3. User presses the Escape key.
 */
export function useDismissOnBlurOrOutside<T extends HTMLElement = HTMLDivElement>({
  isOpen,
  onDismiss,
  closeOnOutsideClick = true,
  closeOnBlur = true,
  closeOnEscape = true,
  ignoreRefs = []
}: UseDismissOptions) {
  const containerRef = useRef<T | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Handle outside clicks (mouse and touch)
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (!closeOnOutsideClick) return;
      const target = event.target as Node;
      if (!containerRef.current) return;

      // Check if click was inside container
      if (containerRef.current.contains(target)) return;

      // Check if click was inside any ignored element (e.g. trigger button)
      for (const ignoreRef of ignoreRefs) {
        if (ignoreRef.current && ignoreRef.current.contains(target)) {
          return;
        }
      }

      onDismiss();
    };

    // Handle focus leaving the container (blur)
    const handleFocusOut = (event: FocusEvent) => {
      if (!closeOnBlur) return;
      if (!containerRef.current) return;

      const newFocusTarget = event.relatedTarget as Node | null;
      // If focus shifted to an element outside our container
      if (newFocusTarget && !containerRef.current.contains(newFocusTarget)) {
        // Also check ignored refs
        for (const ignoreRef of ignoreRefs) {
          if (ignoreRef.current && ignoreRef.current.contains(newFocusTarget)) {
            return;
          }
        }
        onDismiss();
      }
    };

    // Handle Escape key
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!closeOnEscape) return;
      if (event.key === 'Escape' || event.key === 'Esc') {
        event.stopPropagation();
        onDismiss();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick, true);
    document.addEventListener('touchstart', handleOutsideClick, true);
    document.addEventListener('keydown', handleKeyDown, true);

    const el = containerRef.current;
    if (el) {
      el.addEventListener('focusout', handleFocusOut);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick, true);
      document.removeEventListener('touchstart', handleOutsideClick, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      if (el) {
        el.removeEventListener('focusout', handleFocusOut);
      }
    };
  }, [isOpen, onDismiss, closeOnOutsideClick, closeOnBlur, closeOnEscape, ignoreRefs]);

  return containerRef;
}
