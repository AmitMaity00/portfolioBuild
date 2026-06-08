'use client';

import React, { useState } from 'react';
import { Plus, Undo2, Redo2, Grid3x3, Maximize2, Eye, Code2, Download, X, Rocket, Loader } from 'lucide-react';
import { useDesignStore } from '@/lib/designState';
import { generateCompleteHtml, generateReactComponent, downloadCode, designToCode } from '@/lib/designToCode';
import { DesignElement, ElementType } from '@/types/design';
import toast from 'react-hot-toast';
import styles from './Toolbar.module.css';

interface CodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  elements: DesignElement[];
}

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  elements: DesignElement[];
  onShowCode: () => void;
}

const CodeModal: React.FC<CodeModalProps> = ({ isOpen, onClose, elements }) => {
  const [activeTab, setActiveTab] = useState<'html' | 'jsx'>('html');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const html = generateCompleteHtml(elements);
  const jsx = generateReactComponent(elements);
  const code = activeTab === 'html' ? html : jsx;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadCode(activeTab, elements, 'portfolio-design');
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Get Your Code</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'html' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('html')}
          >
            HTML + CSS
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'jsx' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('jsx')}
          >
            React Code
          </button>
        </div>

        <pre className={styles.codeBlock}>
          <code>{code}</code>
        </pre>

        <div className={styles.modalFooter}>
          <button className={styles.copyButton} onClick={handleCopy}>
            {copied ? '✓ Copied!' : 'Copy All Code'}
          </button>
          <button className={styles.downloadButton} onClick={handleDownload}>
            Download File
          </button>
        </div>
      </div>
    </div>
  );
};

const PublishModal: React.FC<PublishModalProps> = ({ isOpen, onClose, elements, onShowCode }) => {
  const [copied, setCopied] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const { html, css } = designToCode(elements);
  const completeHtml = generateCompleteHtml(elements);

  const handleCopy = () => {
    navigator.clipboard.writeText(completeHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadCode('html', elements, 'portfolio');
  };

  const handleDeploy = async () => {
    setDeploying(true);
    try {
      // Convert image elements to base64
      const processedElements = await Promise.all(
        elements.map(async (el) => {
          if (el.type === 'image' && el.content && el.content.startsWith('http')) {
            try {
              const canvas = document.createElement('canvas');
              const img = new Image();
              img.crossOrigin = 'anonymous';
              
              await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = el.content;
              });

              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0);
                return { ...el, content: canvas.toDataURL() };
              }
            } catch (err) {
              console.warn(`Failed to convert image ${el.content}:`, err);
              // Keep original URL if conversion fails
            }
          }
          return el;
        })
      );

      // Generate HTML/CSS with base64 images
      const { html, css } = designToCode(processedElements);
      const completeHtml = generateCompleteHtml(processedElements);

      const response = await fetch('/api/github/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          htmlContent: completeHtml,
          cssContent: css,
          jsContent: '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Deployment failed');
      }

      setDeployedUrl(data.deployedUrl);
      toast.success('🎉 Portfolio Deployed Successfully!');
      // Keep GitHub connection status in sync — update localStorage with deployed URL
      try {
        const cached = localStorage.getItem('github_connection');
        if (cached) {
          const parsed = JSON.parse(cached);
          localStorage.setItem('github_connection', JSON.stringify({
            ...parsed,
            deployedUrl: data.deployedUrl,
          }));
        }
      } catch (_) {}
    } catch (error: any) {
      toast.error(error.message || 'Failed to deploy');
      console.error('Deploy error:', error);
    } finally {
      setDeploying(false);
    }
  };

  if (deployedUrl) {
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.publishModal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2>✅ Portfolio Published!</h2>
            <button className={styles.closeButton} onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className={styles.publishContent}>
            <div className={styles.successMessage}>
              <p>Your portfolio has been successfully deployed to GitHub Pages!</p>
              <a 
                href={deployedUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.deployedLink}
              >
                🌍 View Your Live Portfolio →
              </a>
            </div>

            <div className={styles.publishOptions}>
              <div className={styles.publishOption}>
                <h3>📋 Copy URL</h3>
                <p>Share your portfolio link</p>
                <button 
                  className={styles.primaryButton} 
                  onClick={() => {
                    navigator.clipboard.writeText(deployedUrl);
                    toast.success('Link copied!');
                  }}
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.publishModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Publish Your Site</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.publishContent}>
          <p>Your portfolio is ready! Preview and publish:</p>
          
          <div className={styles.previewSection}>
            <h3>Preview Your Design:</h3>
            <iframe 
              srcDoc={completeHtml} 
              className={styles.publishPreview} 
              title="Site Preview" 
              sandbox="allow-same-origin"
            />
          </div>

          <div className={styles.modalBottom}>
            <button 
              className={styles.secondaryButton} 
              onClick={onShowCode}
            >
              <Code2 size={16} />
              View Code
            </button>
            <button 
              className={styles.secondaryButton} 
              onClick={handleDownload}
            >
              <Download size={16} />
              Download
            </button>
            <button 
              className={`${styles.primaryButton} ${deploying ? styles.loading : ''}`}
              onClick={handleDeploy}
              disabled={deploying}
            >
              {deploying ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Rocket size={16} />
                  Publish Site
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Toolbar: React.FC = () => {
  const { elements, addElement, undo, redo, setZoom, zoom, showGrid, toggleGrid } = useDesignStore();
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  const createNewElement = (type: ElementType) => {
    const newElement: DesignElement = {
      id: `el-${Date.now()}`,
      type,
      x: 50,
      y: 50,
      width: type === 'image' ? 200 : 150,
      height: type === 'image' ? 200 : 50,
      content: type === 'image' ? 'https://via.placeholder.com/200' : `New ${type}`,
      styles: {
        color: '#000000',
        fontSize: 16,
        fontWeight: '400',
        fontFamily: "'Inter', sans-serif",
        textAlign: 'center',
        backgroundColor: type === 'button' ? '#3b82f6' : '#ffffff',
        borderColor: '#e5e5e5',
        borderWidth: 1,
        borderRadius: 4,
        padding: '10px',
        margin: '0',
        opacity: 1,
      },
      zIndex: elements.length,
    };

    addElement(newElement);
  };

  return (
    <>
      <div className={styles.toolbar}>
        {/* Logo / Title */}
        <div className={styles.logo}>
          <h1>Portfolio Designer</h1>
        </div>

        {/* Left section - Add elements */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>Add Elements</div>
          <div className={styles.buttonGroup}>
            <button
              className={styles.toolButton}
              onClick={() => createNewElement('text')}
              title="Add text"
            >
              Text
            </button>
            <button
              className={styles.toolButton}
              onClick={() => createNewElement('image')}
              title="Add image"
            >
              Image
            </button>
            <button
              className={styles.toolButton}
              onClick={() => createNewElement('button')}
              title="Add button"
            >
              Button
            </button>
            <button
              className={styles.toolButton}
              onClick={() => createNewElement('section')}
              title="Add section"
            >
              Section
            </button>
            <button
              className={styles.toolButton}
              onClick={() => createNewElement('card')}
              title="Add card"
            >
              Card
            </button>
          </div>
        </div>

        {/* Middle section - Edit Actions */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>Edit</div>
          <div className={styles.buttonGroup}>
            <button 
              className={styles.actionButton} 
              onClick={() => undo()} 
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={16} />
              Undo
            </button>
            <button 
              className={styles.actionButton} 
              onClick={() => redo()} 
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo2 size={16} />
              Redo
            </button>
            <button
              className={`${styles.actionButton} ${showGrid ? styles.active : ''}`}
              onClick={() => toggleGrid()}
              title="Toggle grid guide"
            >
              <Grid3x3 size={16} />
              Grid
            </button>
          </div>
        </div>

        {/* Right section - View & Export */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>View</div>
          <div className={styles.buttonGroup}>
            <button
              className={styles.actionButton}
              onClick={() => setZoom(zoom - 0.1)}
              title="Zoom out"
            >
              −
            </button>
            <div className={styles.zoomDisplay}>{Math.round(zoom * 100)}%</div>
            <button
              className={styles.actionButton}
              onClick={() => setZoom(zoom + 0.1)}
              title="Zoom in"
            >
              +
            </button>
            <button
              className={styles.actionButton}
              onClick={() => setZoom(1)}
              title="Reset zoom"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>

      </div>

      <CodeModal isOpen={showCodeModal} onClose={() => setShowCodeModal(false)} elements={elements} />
      <PublishModal isOpen={showPublishModal} onClose={() => setShowPublishModal(false)} elements={elements} onShowCode={() => { setShowPublishModal(false); setShowCodeModal(true); }} />
    </>
  );
};
