import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Download, Lock, ChevronLeft, ChevronRight, Loader, Maximize, Minimize, Search } from 'lucide-react';
import { Ebook, UserRole } from '../types';

interface EbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  ebook: Ebook | null;
  userRole?: UserRole;
}

const LENS_W    = 340;
const LENS_H    = 260;
const LENS_BAR  = 30;
const MAG_STEP  = 0.25;
const MAG_MAX   = 6.0;
const LH        = LENS_H - LENS_BAR;

export const EbookModal: React.FC<EbookModalProps> = ({ isOpen, onClose, ebook, userRole }) => {
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const lensCanvasRef  = useRef<HTMLCanvasElement>(null);
  const modalRef       = useRef<HTMLDivElement>(null);
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const mainIframeRef  = useRef<HTMLIFrameElement>(null);
  const lensIframeRef  = useRef<HTMLIFrameElement>(null);
  const renderTaskRef  = useRef<any>(null);
  const rafRef         = useRef<number>(0);

  // lens drag — moves the floating lens (viewport coords)
  const isDragging   = useRef(false);
  const dragOffset   = useRef({ x: 0, y: 0 });
  const lensPosRef   = useRef({ x: 0, y: 0 });

  // lens pan — pans content inside the glass
  const isPanning            = useRef(false);
  const [isGrabbing,         setIsGrabbing]         = useState(false);
  const panStart             = useRef({ x: 0, y: 0 });
  const lensContentOffsetRef = useRef({ x: 0, y: 0 });
  const lensZoomRef          = useRef(0.3);
  const fitZoomRef           = useRef(0.3);

  const [pdfDoc,            setPdfDoc]            = useState<any>(null);
  const [currentPage,       setCurrentPage]       = useState(1);
  const [totalPages,        setTotalPages]        = useState(0);
  const [loading,           setLoading]           = useState(false);
  const [error,             setError]             = useState('');
  const [isFullscreen,      setIsFullscreen]      = useState(false);
  const [zoom,              setZoom]              = useState(100);
  const [showLens,          setShowLens]          = useState(false);
  const [lensPos,           setLensPos]           = useState({ x: 0, y: 0 });
  const [lensReady,         setLensReady]         = useState(false);
  const [lensZoom,          setLensZoom]          = useState(0.3);
  const [fitZoom,           setFitZoom]           = useState(0.3);
  const [lensContentOffset, setLensContentOffset] = useState({ x: 0, y: 0 });

  const canDownload = userRole !== 'VISITANTE' && userRole !== 'MEMBRO';

  useEffect(() => { lensPosRef.current           = lensPos;            }, [lensPos]);
  useEffect(() => { lensZoomRef.current          = lensZoom;           }, [lensZoom]);
  useEffect(() => { fitZoomRef.current           = fitZoom;            }, [fitZoom]);
  useEffect(() => { lensContentOffsetRef.current = lensContentOffset;  }, [lensContentOffset]);

  // Calcula fitZoom para PDF (canvas já renderizado)
  const computeFitZoomFromCanvas = useCallback(() => {
    const c = canvasRef.current;
    if (!c || !c.offsetWidth || !c.offsetHeight) return;
    const fz = Math.min(LENS_W / c.offsetWidth, LH / c.offsetHeight);
    setFitZoom(fz);
    setLensZoom(fz);
    fitZoomRef.current  = fz;
    lensZoomRef.current = fz;
  }, []);

  // Calcula fitZoom para iframe HTML (same-origin)
  const computeFitZoomFromIframe = useCallback((iframe: HTMLIFrameElement) => {
    try {
      const doc = iframe.contentDocument;
      if (!doc || !doc.body) return;
      const w = doc.body.scrollWidth  || doc.documentElement.scrollWidth  || LENS_W;
      const h = doc.body.scrollHeight || doc.documentElement.scrollHeight || LH;
      const fz = Math.min(LENS_W / w, LH / h);
      setFitZoom(fz);
      setLensZoom(fz);
      fitZoomRef.current  = fz;
      lensZoomRef.current = fz;
    } catch (_) {
      // cross-origin fallback
      const fz = 0.25;
      setFitZoom(fz); setLensZoom(fz);
      fitZoomRef.current = fz; lensZoomRef.current = fz;
    }
  }, []);

  const changeLensZoom = useCallback((delta: number) => {
    setLensZoom(z => {
      const next = Math.round((z + delta) * 100) / 100;
      return Math.max(fitZoomRef.current, Math.min(MAG_MAX, next));
    });
  }, []);

  // ── fullscreen ────────────────────────────────────────────────────────────
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      modalRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);

  // ── PDF loading ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !ebook?.downloadUrl) return;
    if (ebook.downloadUrl.includes('drive.google.com')) return;
    if (ebook.downloadUrl.toLowerCase().endsWith('.html')) return;
    setLoading(true); setError(''); setPdfDoc(null);
    setCurrentPage(1); setTotalPages(0);
    import('pdfjs-dist').then((lib) => {
      lib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
      lib.getDocument(ebook.downloadUrl!).promise
        .then((doc: any) => { setPdfDoc(doc); setTotalPages(doc.numPages); setLoading(false); })
        .catch(() => { setError('Não foi possível carregar o PDF.'); setLoading(false); });
    });
  }, [isOpen, ebook?.downloadUrl]);

  // ── PDF rendering ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    if (renderTaskRef.current) renderTaskRef.current.cancel();
    const scale = (zoom / 100) * (window.devicePixelRatio > 1 ? 1.5 : 2);
    pdfDoc.getPage(currentPage).then((page: any) => {
      const canvas = canvasRef.current!;
      const ctx    = canvas.getContext('2d')!;
      const vp     = page.getViewport({ scale });
      canvas.width  = vp.width;
      canvas.height = vp.height;
      canvas.style.width  = '100%';
      canvas.style.height = 'auto';
      const task = page.render({ canvasContext: ctx, viewport: vp });
      renderTaskRef.current = task;
      task.promise.catch(() => {});
    task.promise.then(() => {
      if (showLens) computeFitZoomFromCanvas();
    }).catch(() => {});
    });
  }, [pdfDoc, currentPage, zoom, showLens, computeFitZoomFromCanvas]);

  // ── Lens canvas RAF loop (PDF) ────────────────────────────────────────────
  // lensPos is now in VIEWPORT (fixed) coordinates.
  // We map lens centre → canvas pixel coords via getBoundingClientRect.
  const drawLensCanvas = useCallback(() => {
    const src  = canvasRef.current;
    const dst  = lensCanvasRef.current;
    if (!src || !dst || !src.width || !src.offsetWidth) return;
    const ctx = dst.getContext('2d');
    if (!ctx) return;

    const mag              = lensZoomRef.current;
    const { x: panX, y: panY } = lensContentOffsetRef.current;
    const lh               = LENS_H - LENS_BAR;

    dst.width  = LENS_W;
    dst.height = lh;

    // canvas position in viewport
    const cr       = src.getBoundingClientRect();
    const cssScale = src.width / cr.width;   // internal px / css px

    // lens glass centre in viewport
    const lcx = lensPosRef.current.x + LENS_W / 2;
    const lcy = lensPosRef.current.y + LENS_BAR + lh / 2;

    // corresponding point on the canvas (css px from canvas top-left)
    const cxLocal = lcx - cr.left + panX / mag;
    const cyLocal = lcy - cr.top  + panY / mag;

    // source rectangle in canvas internal pixels
    const sw = (LENS_W / mag) * cssScale;
    const sh = (lh     / mag) * cssScale;
    const sx = (cxLocal - LENS_W / (2 * mag)) * cssScale;
    const sy = (cyLocal - lh   / (2 * mag)) * cssScale;

    ctx.clearRect(0, 0, LENS_W, lh);

    const csx = Math.max(0, sx);
    const csy = Math.max(0, sy);
    const csw = Math.min(sw, src.width  - csx);
    const csh = Math.min(sh, src.height - csy);

    if (csw > 0 && csh > 0) {
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, LENS_W, lh);
      const dsx = (csx - sx) / cssScale * mag;
      const dsy = (csy - sy) / cssScale * mag;
      ctx.drawImage(src, csx, csy, csw, csh, dsx, dsy, csw / cssScale * mag, csh / cssScale * mag);
    }

    rafRef.current = requestAnimationFrame(drawLensCanvas);
  }, []);

  useEffect(() => {
    if (showLens && pdfDoc) {
      rafRef.current = requestAnimationFrame(drawLensCanvas);
      return () => cancelAnimationFrame(rafRef.current);
    }
  }, [showLens, pdfDoc, drawLensCanvas]);

  // ── Iframe sync (HTML / Google Drive) ────────────────────────────────────
  const syncLensIframe = useCallback(() => {
    const mi = mainIframeRef.current;
    const li = lensIframeRef.current;
    if (!mi || !li) return;
    try {
      const mw  = mi.contentWindow!;
      const lw  = li.contentWindow!;
      const mag = lensZoomRef.current;
      const { x: panX, y: panY } = lensContentOffsetRef.current;

      const ir  = mi.getBoundingClientRect();
      const lcx = lensPosRef.current.x + LENS_W / 2;
      const lcy = lensPosRef.current.y + LENS_BAR + (LENS_H - LENS_BAR) / 2;

      const cx = (lcx - ir.left) + (mw.scrollX ?? 0) + panX / mag;
      const cy = (lcy - ir.top)  + (mw.scrollY ?? 0) + panY / mag;

      lw.scrollTo({
        left: cx - LENS_W / (2 * mag),
        top:  cy - (LENS_H - LENS_BAR) / (2 * mag),
        behavior: 'instant' as ScrollBehavior,
      });
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (showLens && lensReady) syncLensIframe();
  }, [lensPos, lensContentOffset, showLens, lensReady, syncLensIframe]);

  useEffect(() => {
    if (!showLens || !mainIframeRef.current) return;
    try {
      const mw = mainIframeRef.current.contentWindow!;
      mw.addEventListener('scroll', syncLensIframe);
      return () => mw.removeEventListener('scroll', syncLensIframe);
    } catch (_) {}
  }, [showLens, lensReady, syncLensIframe]);

  // ── Place lens outside the PDF viewer when opened ────────────────────────
  // Centraliza a lupa no viewport ao abrir + calcula fitZoom
  useEffect(() => {
    if (!showLens) return;
    setLensPos({
      x: Math.max(0, (window.innerWidth  - LENS_W) / 2),
      y: Math.max(0, (window.innerHeight - LENS_H) / 2),
    });
    setLensContentOffset({ x: 0, y: 0 });
    setLensReady(false);
    // Se for PDF e canvas já estiver renderizado, calcula agora
    if (canvasRef.current && canvasRef.current.offsetWidth) {
      computeFitZoomFromCanvas();
    } else if (!canvasRef.current) {
      // iframe — será calculado no onLoad do lensIframe
      const fz = 0.25;
      setFitZoom(fz); setLensZoom(fz);
      fitZoomRef.current = fz; lensZoomRef.current = fz;
    }
  }, [showLens, computeFitZoomFromCanvas]);

  // ── Drag: bar moves the whole lens (viewport coords) ─────────────────────
  const onLensBarPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    isDragging.current = true;
    dragOffset.current = {
      x: e.clientX - lensPosRef.current.x,
      y: e.clientY - lensPosRef.current.y,
    };
  };
  const onLensBarPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    setLensPos({
      x: Math.max(0, Math.min(window.innerWidth  - LENS_W, e.clientX - dragOffset.current.x)),
      y: Math.max(0, Math.min(window.innerHeight - LENS_H, e.clientY - dragOffset.current.y)),
    });
  };
  const onLensBarPointerUp = () => { isDragging.current = false; };

  // ── Pan: drag glass pans content ─────────────────────────────────────────
  const onGlassPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    isPanning.current = true;
    setIsGrabbing(true);
    panStart.current = {
      x: e.clientX - lensContentOffsetRef.current.x,
      y: e.clientY - lensContentOffsetRef.current.y,
    };
  };
  const onGlassPointerMove = (e: React.PointerEvent) => {
    if (!isPanning.current) return;
    setLensContentOffset({
      x: e.clientX - panStart.current.x,
      y: e.clientY - panStart.current.y,
    });
  };
  const onGlassPointerUp = () => { isPanning.current = false; setIsGrabbing(false); };

  // ── cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setPdfDoc(null); setCurrentPage(1); setTotalPages(0);
      setError(''); setZoom(100); setIsFullscreen(false);
      setShowLens(false); setLensReady(false);
      setLensZoom(0.3); setFitZoom(0.3); setLensContentOffset({ x: 0, y: 0 });
      cancelAnimationFrame(rafRef.current);
    }
  }, [isOpen]);

  if (!ebook) return null;

  const isGoogleDrive = ebook.downloadUrl?.includes('drive.google.com');
  const isHtml        = ebook.downloadUrl?.toLowerCase().endsWith('.html');
  const hasPdf        = !isGoogleDrive && !isHtml && !!ebook.downloadUrl;

  const iframeLensStyle: React.CSSProperties = {
    width:           `${LENS_W / lensZoom}px`,
    height:          `${(LENS_H - LENS_BAR) / lensZoom}px`,
    transform:       `scale(${lensZoom})`,
    transformOrigin: 'top left',
    border:          'none',
    pointerEvents:   'none',
    display:         'block',
  };

  return (<>
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          />
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-gray-900 rounded-2xl border border-[#D4AF37]/30 shadow-[0_0_50px_rgba(212,175,55,0.15)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-black/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                  <BookOpen className="text-[#D4AF37]" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold leading-tight">{ebook.title}</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Leitor Digital Imperial</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Lupa */}
                <button
                  onClick={() => setShowLens(v => !v)}
                  className={`p-2 rounded-lg transition-all ${
                    showLens
                      ? 'text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                  title={showLens ? 'Fechar lupa' : 'Lupa'}
                >
                  <Search size={18} />
                </button>
                {ebook.downloadUrl && (
                  canDownload ? (
                    <a href={ebook.downloadUrl} target="_blank" rel="noopener noreferrer"
                      className="hidden sm:flex items-center gap-2 bg-[#D4AF37] text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#b5952f] transition-all">
                      <Download size={14} /> BAIXAR PDF
                    </a>
                  ) : (
                    <div className="hidden sm:flex items-center gap-2 bg-gray-800 text-gray-500 px-4 py-2 rounded-lg text-xs font-bold cursor-not-allowed border border-gray-700">
                      <Lock size={14} /> DOWNLOAD BLOQUEADO
                    </div>
                  )
                )}
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div ref={contentAreaRef} className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative">

              {/* Fullscreen overlay */}
              <button
                onClick={toggleFullscreen}
                className="absolute top-2 right-2 z-10 p-1.5 bg-black/60 hover:bg-black/80 text-gray-300 hover:text-white rounded-lg transition-all backdrop-blur-sm border border-white/10"
                title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
              >
                {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              </button>

              {/* Main ebook content */}
              {ebook.downloadUrl && ebook.downloadUrl.trim() !== '' ? (
                isHtml ? (
                  <div className="w-full h-[70vh]">
                    <iframe ref={mainIframeRef} src={ebook.downloadUrl} className="w-full h-full border-0 block" title={ebook.title} />
                  </div>
                ) : isGoogleDrive ? (
                  <div className="w-full h-[70vh]">
                    <iframe
                      ref={mainIframeRef}
                      src={ebook.downloadUrl.replace('/view?usp=sharing', '/preview').replace('/view', '/preview')}
                      className="w-full h-full border-0 block"
                      title="PDF Viewer"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    {loading && (
                      <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
                        <Loader size={24} className="animate-spin" />
                        <span className="text-sm">Carregando e-book...</span>
                      </div>
                    )}
                    {error && <div className="flex items-center justify-center h-64 text-red-400 text-sm">{error}</div>}
                    {!loading && !error && <canvas ref={canvasRef} className="w-full" />}
                    {totalPages > 0 && (
                      <div className="sticky bottom-0 w-full flex items-center justify-center gap-4 py-3 bg-gray-900/95 border-t border-gray-800">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                          className="p-2 rounded-lg bg-gray-800 text-white disabled:opacity-30 hover:bg-gray-700 transition-all">
                          <ChevronLeft size={18} />
                        </button>
                        <span className="text-gray-400 text-sm font-bold">{currentPage} / {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                          className="p-2 rounded-lg bg-gray-800 text-white disabled:opacity-30 hover:bg-gray-700 transition-all">
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                )
              ) : (
                <div className="p-6 sm:p-8">
                  <div
                    className="max-w-2xl mx-auto prose prose-invert prose-gold overflow-x-hidden w-full"
                    style={{ fontSize: `${zoom}%` }}
                    dangerouslySetInnerHTML={{ __html: ebook.content || '' }}
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 border-t border-gray-800 bg-black/30 flex flex-wrap items-center justify-center sm:justify-between gap-1 text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              <span className="text-center">© DIETA MILENAR - TODOS OS DIREITOS RESERVADOS</span>
              <span className="hidden sm:inline">PROPRIEDADE EXCLUSIVA DO IMPÉRIO</span>
            </div>
          </motion.div>
        </div>
      )}

    </AnimatePresence>

    {/* ── Lupa flutuante — portal direto no body, fora de qualquer overflow:hidden ── */}
    {isOpen && showLens && ReactDOM.createPortal(
      <div
        style={{
          position:     'fixed',
          left:         lensPos.x,
          top:          lensPos.y,
          width:        LENS_W,
          height:       LENS_H,
          zIndex:       99999,
          borderRadius: 12,
          border:       '2px solid rgba(212,175,55,0.85)',
          boxShadow:    '0 0 0 1px rgba(0,0,0,0.6), 0 16px 48px rgba(0,0,0,0.8)',
          overflow:     'hidden',
          userSelect:   'none',
        }}
      >
        {/* Barra de título — arrastar move a lupa */}
        <div
          style={{
            position:       'absolute',
            top: 0, left: 0, right: 0,
            height:         LENS_BAR,
            background:     'rgba(0,0,0,0.95)',
            borderBottom:   '1px solid rgba(212,175,55,0.35)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            padding:        '0 8px',
            zIndex:         2,
            cursor:         'grab',
            touchAction:    'none',
          }}
          onPointerDown={onLensBarPointerDown}
          onPointerMove={onLensBarPointerMove}
          onPointerUp={onLensBarPointerUp}
          onPointerCancel={onLensBarPointerUp}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, pointerEvents: 'none' }}>
            <Search size={11} color="rgba(212,175,55,0.85)" />
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(212,175,55,0.75)' }}>
              LUPA
            </span>
          </div>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            onPointerDown={e => e.stopPropagation()}
          >
            <button
              onClick={e => { e.stopPropagation(); changeLensZoom(-MAG_STEP); }}
              disabled={lensZoom <= fitZoom + 0.005}
              style={{
                background: 'none', border: '1px solid rgba(212,175,55,0.45)',
                borderRadius: 3, padding: '1px 6px',
                color: lensZoom <= fitZoom + 0.005 ? 'rgba(212,175,55,0.3)' : 'rgba(212,175,55,0.9)',
                cursor: lensZoom <= fitZoom + 0.005 ? 'not-allowed' : 'pointer',
                fontSize: 13, lineHeight: 1, fontWeight: 700,
              }}
            >−</button>
            <span style={{
              fontSize: 10, fontWeight: 700, color: 'rgba(212,175,55,0.9)',
              minWidth: 32, textAlign: 'center', letterSpacing: '0.04em',
            }}>
              {lensZoom <= fitZoom + 0.01
                ? '0%'
                : `${Math.round(((lensZoom - fitZoom) / (MAG_MAX - fitZoom)) * 100)}%`}
            </span>
            <button
              onClick={e => { e.stopPropagation(); changeLensZoom(MAG_STEP); }}
              disabled={lensZoom >= MAG_MAX}
              style={{
                background: 'none', border: '1px solid rgba(212,175,55,0.45)',
                borderRadius: 3, padding: '1px 6px',
                color: lensZoom >= MAG_MAX ? 'rgba(212,175,55,0.3)' : 'rgba(212,175,55,0.9)',
                cursor: lensZoom >= MAG_MAX ? 'not-allowed' : 'pointer',
                fontSize: 13, lineHeight: 1, fontWeight: 700,
              }}
            >+</button>
          </div>
        </div>

        {/* Vidro */}
        <div
          style={{
            position:    'absolute',
            top:         LENS_BAR,
            left:        0,
            width:       LENS_W,
            height:      LENS_H - LENS_BAR,
            overflow:    'hidden',
            background:  '#0a0a0a',
            cursor:      isGrabbing ? 'grabbing' : 'grab',
            touchAction: 'none',
          }}
          onPointerDown={onGlassPointerDown}
          onPointerMove={onGlassPointerMove}
          onPointerUp={onGlassPointerUp}
          onPointerCancel={onGlassPointerUp}
        >
          {isHtml && ebook.downloadUrl && (
            <iframe
              ref={lensIframeRef}
              src={ebook.downloadUrl}
              onLoad={() => {
                try {
                  const doc = lensIframeRef.current!.contentDocument!;
                  const s = doc.createElement('style');
                  s.textContent = '::-webkit-scrollbar{display:none!important}html,body{scrollbar-width:none!important;overflow:scroll!important}';
                  doc.head.appendChild(s);
                } catch (_) {}
                setLensReady(true);
                setTimeout(syncLensIframe, 80);
              }}
              style={iframeLensStyle}
              title="lupa"
            />
          )}
          {isGoogleDrive && ebook.downloadUrl && (
            <iframe
              ref={lensIframeRef}
              src={ebook.downloadUrl.replace('/view?usp=sharing', '/preview').replace('/view', '/preview')}
              style={iframeLensStyle}
              title="lupa"
            />
          )}
          {hasPdf && (
            <canvas ref={lensCanvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
          )}
          {!ebook.downloadUrl && ebook.content && (
            <div
              style={{
                width: `${LENS_W / lensZoom}px`,
                height: `${(LENS_H - LENS_BAR) / lensZoom}px`,
                transform: `scale(${lensZoom})`,
                transformOrigin: 'top left',
                overflow: 'hidden', pointerEvents: 'none',
                padding: 8, color: '#fff', fontSize: 8,
              }}
              dangerouslySetInnerHTML={{ __html: ebook.content }}
            />
          )}
        </div>

        {/* Vinheta */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          boxShadow: 'inset 0 0 28px rgba(0,0,0,0.5)',
          borderRadius: 10,
        }} />

        <div style={{
          position: 'absolute', bottom: 4, left: 0, right: 0,
          textAlign: 'center', pointerEvents: 'none',
          fontSize: 8, color: 'rgba(212,175,55,0.3)',
          fontWeight: 700, letterSpacing: '0.08em',
        }}>
          ↔ ARRASTE PARA NAVEGAR ↔
        </div>
      </div>,
      document.body
    )}
  </>
  );
};
