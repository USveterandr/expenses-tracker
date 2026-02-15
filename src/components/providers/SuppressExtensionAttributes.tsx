'use client';

import { useEffect } from 'react';

/**
 * This component removes browser extension attributes that cause hydration mismatches.
 * Add it to your layout to prevent console errors from extensions like Grammarly, Writer, etc.
 */
export function SuppressExtensionAttributes() {
  useEffect(() => {
    // Remove common extension attributes that cause hydration issues
    const extensionAttributes = [
      'data-writer-injected',
      'data-new-gr-c-s-check-loaded',
      'data-gr-ext-installed',
      'data-gr-c-s-loaded',
      'grammarly-shadow-root',
      '__gclid',
      '__gtm',
      'data-lt-installed',
    ];

    // Clean up body attributes
    extensionAttributes.forEach((attr) => {
      if (document.body.hasAttribute(attr)) {
        document.body.removeAttribute(attr);
      }
    });

    // Clean up html attributes
    extensionAttributes.forEach((attr) => {
      if (document.documentElement.hasAttribute(attr)) {
        document.documentElement.removeAttribute(attr);
      }
    });

    // Clean up all elements with these attributes
    extensionAttributes.forEach((attr) => {
      const elements = document.querySelectorAll(`[${attr}]`);
      elements.forEach((el) => {
        el.removeAttribute(attr);
      });
    });
  }, []);

  return null;
}
