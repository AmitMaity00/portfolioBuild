'use client';

import React, { useMemo } from 'react';
import { useDesignStore } from '@/lib/designState';
import { designToCode } from '@/lib/designToCode';
import styles from './DesignPreview.module.css';

export const DesignPreview: React.FC = () => {
  const { elements } = useDesignStore();

  const { html, css } = useMemo(() => {
    return designToCode(elements);
  }, [elements]);

  const srcDoc = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Design Preview</title>
      <style>
        ${css}
      </style>
    </head>
    <body>
      ${html}
      <script>
        // Disable interactions and clicks in preview
        document.body.style.pointerEvents = 'none';
      </script>
    </body>
    </html>
  `;

  return (
    <div className={styles.previewContainer}>
      <div className={styles.previewHeader}>
        <h3>Live Preview</h3>
      </div>
      <iframe srcDoc={srcDoc} className={styles.previewFrame} title="Design Preview" sandbox="allow-same-origin" />
    </div>
  );
};
