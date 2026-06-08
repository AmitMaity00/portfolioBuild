import { DesignElement, Breakpoint, GeneratedCode, DesignStyles } from '@/types/design';

// Convert image URL to base64
async function urlToBase64(url: string): Promise<string> {
  try {
    // If it's already base64, return as-is
    if (url.startsWith('data:')) {
      return url;
    }

    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Failed to convert image to base64:', error);
    // Return placeholder if conversion fails
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3C/svg%3E';
  }
}

// Convert styles object to inline CSS string
function stylesToInlineCss(styles: Partial<DesignStyles> = {}): string {
  const cssProperties: Record<string, string> = {};

  if (styles.color) cssProperties['color'] = styles.color;
  if (styles.fontSize) cssProperties['font-size'] = `${styles.fontSize}px`;
  if (styles.fontWeight) cssProperties['font-weight'] = styles.fontWeight;
  if (styles.fontFamily) cssProperties['font-family'] = styles.fontFamily;
  if (styles.textAlign) cssProperties['text-align'] = styles.textAlign;
  if (styles.lineHeight) cssProperties['line-height'] = styles.lineHeight.toString();
  if (styles.backgroundColor) cssProperties['background-color'] = styles.backgroundColor;
  if (styles.borderColor && styles.borderWidth) {
    cssProperties['border'] = `${styles.borderWidth}px solid ${styles.borderColor}`;
  }
  if (styles.borderRadius) cssProperties['border-radius'] = `${styles.borderRadius}px`;
  if (styles.boxShadow) cssProperties['box-shadow'] = styles.boxShadow;
  if (styles.padding) cssProperties['padding'] = styles.padding;
  if (styles.margin) cssProperties['margin'] = styles.margin;
  if (styles.opacity !== undefined) cssProperties['opacity'] = styles.opacity.toString();
  if (styles.display) cssProperties['display'] = styles.display;
  if (styles.flexDirection) cssProperties['flex-direction'] = styles.flexDirection;
  if (styles.justifyContent) cssProperties['justify-content'] = styles.justifyContent;
  if (styles.alignItems) cssProperties['align-items'] = styles.alignItems;
  if (styles.gap) cssProperties['gap'] = `${styles.gap}px`;
  if (styles.transform) cssProperties['transform'] = styles.transform;
  if (styles.transition) cssProperties['transition'] = styles.transition;

  return Object.entries(cssProperties)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ');
}

// Generate CSS class-based styles
function generateCssClasses(elements: DesignElement[]): string {
  // Calculate canvas size based on elements
  let maxWidth = 1200;
  let maxHeight = 800;
  
  if (elements.length > 0) {
    maxWidth = Math.max(...elements.map(el => el.x + el.width), 1200);
    maxHeight = Math.max(...elements.map(el => el.y + el.height), 800);
  }

  let css = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background-color: #f9fafb;
      color: #000000;
      line-height: 1.5;
      padding: 20px;
      overflow-x: auto;
    }

    .design-canvas {
      position: relative;
      width: ${maxWidth}px;
      height: ${maxHeight}px;
      background: white;
      margin: 0 auto;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      border-radius: 4px;
    }

    .design-element {
      position: absolute;
      box-sizing: border-box;
    }

    .design-element.text {
      word-break: break-word;
      white-space: pre-wrap;
      overflow: hidden;
    }

    .design-element.image {
      overflow: hidden;
    }

    .design-element.image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .design-element.button {
      cursor: pointer;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      transition: all 0.2s ease;
      font-family: inherit;
      padding: 10px 20px;
    }

    .design-element.button:hover {
      transform: translateY(-2px);
      opacity: 0.9;
    }

    .design-element.button:active {
      transform: translateY(0);
    }

    .design-element.section {
      width: 100%;
      position: relative;
      overflow: hidden;
    }

    .design-element.card {
      border-radius: 8px;
      overflow: hidden;
    }

    .card-content {
      width: 100%;
      height: 100%;
      overflow: auto;
    }
  `;

  // Generate individual element styles
  elements.forEach((el) => {
    const inlineStyle = stylesToInlineCss(el.styles);
    css += `
      #el-${el.id} {
        left: ${el.x}px;
        top: ${el.y}px;
        width: ${el.width}px;
        height: ${el.height}px;
        z-index: ${el.zIndex};
        overflow: ${el.type === 'text' ? 'hidden' : el.type === 'image' ? 'hidden' : 'visible'};
        ${inlineStyle};
        ${el.hidden ? 'display: none !important;' : ''}
        ${el.locked ? 'pointer-events: none;' : ''}
      }
    `;
  });

  return css;
}

// Generate responsive media queries
function generateResponsiveCss(elements: DesignElement[]): string {
  let css = '';

  // Tablet breakpoint
  css += `
    @media (max-width: 1024px) {
  `;
  elements.forEach((el) => {
    if (el.responsive?.tablet) {
      const override = el.responsive.tablet;
      css += `#el-${el.id} { `;
      if (override.width) css += `width: ${override.width}px !important; `;
      if (override.height) css += `height: ${override.height}px !important; `;
      if (override.fontSize) css += `font-size: ${override.fontSize}px !important; `;
      if (override.padding) css += `padding: ${override.padding} !important; `;
      if (override.margin) css += `margin: ${override.margin} !important; `;
      if (override.display) css += `display: ${override.display} !important; `;
      css += ` } `;
    }
  });
  css += ` } `;

  // Mobile breakpoint
  css += `
    @media (max-width: 480px) {
  `;
  elements.forEach((el) => {
    if (el.responsive?.mobile) {
      const override = el.responsive.mobile;
      css += `#el-${el.id} { `;
      if (override.width) css += `width: ${override.width}px !important; `;
      if (override.height) css += `height: ${override.height}px !important; `;
      if (override.fontSize) css += `font-size: ${override.fontSize}px !important; `;
      if (override.padding) css += `padding: ${override.padding} !important; `;
      if (override.margin) css += `margin: ${override.margin} !important; `;
      if (override.display) css += `display: ${override.display} !important; `;
      css += ` } `;
    }
  });
  css += ` } `;

  return css;
}

// Generate HTML content based on breakpoint
function generateHtmlContent(elements: DesignElement[]): string {
  let html = '<div class="design-canvas">\n';

  // Sort by z-index
  const sorted = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  sorted.forEach((el) => {
    const inlineStyle = stylesToInlineCss(el.styles);
    const isHidden = el.hidden ? ' style="display: none;"' : '';

    switch (el.type) {
      case 'text':
        html += `  <div id="el-${el.id}" class="design-element text" style="${inlineStyle}"${isHidden}>${escapeHtml(el.content)}</div>\n`;
        break;
      case 'image':
        // Ensure image URLs work across domains
        html += `  <div id="el-${el.id}" class="design-element image" style="${inlineStyle}"${isHidden}><img src="${el.content}" alt="portfolio image" crossorigin="anonymous" style="width: 100%; height: 100%; object-fit: cover;" /></div>\n`;
        break;
      case 'button':
        html += `  <button id="el-${el.id}" class="design-element button" style="${inlineStyle}"${isHidden}>${escapeHtml(el.content)}</button>\n`;
        break;
      case 'section':
        html += `  <section id="el-${el.id}" class="design-element section" style="${inlineStyle}"${isHidden}>${escapeHtml(el.content)}</section>\n`;
        break;
      case 'card':
        html += `  <div id="el-${el.id}" class="design-element card" style="${inlineStyle}"${isHidden}><div class="card-content">${escapeHtml(el.content)}</div></div>\n`;
        break;
    }
  });

  html += '</div>';
  return html;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

// Convert image to base64 (for embedding)
export async function imageToBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL());
      } else {
        reject(new Error('Failed to get canvas context'));
      }
    };
    img.onerror = () => resolve(url); // Fallback to original URL if conversion fails
    img.src = url;
  });
}

// Main export function
export function designToCode(elements: DesignElement[]): GeneratedCode {
  const html = generateHtmlContent(elements);
  const css = generateCssClasses(elements) + '\n' + generateResponsiveCss(elements);

  return {
    html,
    css,
  };
}

// Generate complete HTML document
export function generateCompleteHtml(elements: DesignElement[]): string {
  const { html, css } = designToCode(elements);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portfolio Design</title>
  <style>
    ${css}
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
}

// Generate as React component (JSX)
export function generateReactComponent(elements: DesignElement[]): string {
  const componentName = 'PortfolioDesign';

  let jsxCode = `import React from 'react';\n\ninterface Props {}\n\nexport const ${componentName}: React.FC<Props> = () => {\n  return (\n    <div className="design-canvas">\n`;

  const sorted = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  sorted.forEach((el) => {
    const style = el.styles;
    const styleObj = JSON.stringify(style, null, 6).replace(/"/g, "'");
    const isHidden = el.hidden ? ' hidden' : '';

    switch (el.type) {
      case 'text':
        jsxCode += `      <div id="el-${el.id}" className="design-element text${isHidden}" style={${styleObj}}>\n        {${JSON.stringify(el.content)}}\n      </div>\n`;
        break;
      case 'image':
        jsxCode += `      <div id="el-${el.id}" className="design-element image${isHidden}" style={${styleObj}}>\n        <img src="${el.content}" alt="image" />\n      </div>\n`;
        break;
      case 'button':
        jsxCode += `      <button id="el-${el.id}" className="design-element button${isHidden}" style={${styleObj}}>\n        {${JSON.stringify(el.content)}}\n      </button>\n`;
        break;
      case 'section':
        jsxCode += `      <section id="el-${el.id}" className="design-element section${isHidden}" style={${styleObj}}>\n        {${JSON.stringify(el.content)}}\n      </section>\n`;
        break;
      case 'card':
        jsxCode += `      <div id="el-${el.id}" className="design-element card${isHidden}" style={${styleObj}}>\n        {${JSON.stringify(el.content)}}\n      </div>\n`;
        break;
    }
  });

  jsxCode += `    </div>\n  );\n};\n`;

  return jsxCode;
}

// Export code for download
export function downloadCode(format: 'html' | 'jsx', elements: DesignElement[], filename: string) {
  let content: string;
  let type: string;

  if (format === 'html') {
    content = generateCompleteHtml(elements);
    type = 'text/html';
    filename = filename.endsWith('.html') ? filename : `${filename}.html`;
  } else {
    content = generateReactComponent(elements);
    type = 'text/plain';
    filename = filename.endsWith('.tsx') ? filename : `${filename}.tsx`;
  }

  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
