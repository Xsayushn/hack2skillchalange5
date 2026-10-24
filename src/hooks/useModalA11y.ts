import { useEffect, useRef } from 'react';

interface UseModalA11yOptions {
  isOpen: boolean;
  onClose: () => void;
}

export function useModalA11y<T extends HTMLElement = HTMLDivElement>({
  isOpen,
  onClose
}: UseModalA11yOptions) {
  const containerRef = useRef<T | null>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Remember previous active element to restore focus on close
    previousActiveElement.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    if (container) {
      // Find all focusable elements
      const focusableElements = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        // Auto-focus first focusable element
        focusableElements[0].focus();
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Escape to close
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // 2. Focus trap
      if (e.key === 'Tab' && container) {
        const focusables = Array.from(
          container.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );

        if (focusables.length === 0) return;

        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Restore focus
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, onClose]);

  return containerRef;
}
