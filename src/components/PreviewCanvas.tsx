'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Columns,
  Eye,
  Sliders,
  Sparkles,
  Check,
  Copy,
  AlertTriangle,
  Tv,
  Waves
} from 'lucide-react';
import { QualityReport } from '@/lib/types';

interface PreviewCanvasProps {
  originalUrl: string | null;
  outputUrl: string | null;
  report: QualityReport | null;
  themeName?: string;
  onRegenerate: () => void;
  onSaveToMemory: () => void;
  isProcessing: boolean;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  originalUrl,
  outputUrl,
  report,
  themeName,
  onRegenerate,
  onSaveToMemory,
  isProcessing
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'overlay' | 'side-by-side' | 'obs-sim'>('split');
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 - 100
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = 100%
  const [canvasBg, setCanvasBg] = useState<'ocean' | 'checker' | 'checker-dark' | 'black'>('ocean');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // Split slider mouse handlers
  const handleMouseDown = () => {
    isDraggingRef.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(pct);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDraggingRef.current = false;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const handleDownloadPNG = () => {
    if (!outputUrl) return;
    const a = document.createElement('a');
    a.href = outputUrl;
    a.download = `overlay_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadOBSPackage = () => {
    if (!outputUrl || !report) return;
    const obsConfig = {
      name: "AI Overlay Designer OBS Import",
      version: "1.0",
      resolution: report.dimensions,
      transparency_percentage: report.transparency_percentage,
      palette: report.palette,
      effects: report.effects_applied,
      instructions: "Thêm file PNG này vào OBS Studio dưới dạng 'Image Source' (Nguồn Hình Ảnh). Khung đã có sẵn kênh Alpha trong suốt hoàn chỉnh."
    };
    const blob = new Blob([JSON.stringify(obsConfig, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `obs_overlay_metadata.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!outputUrl && !originalUrl) {
    return (
      <div className="flex h-[520px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-cyan-500/30 bg-[#061d3c]/50 p-8 text-center shadow-[0_8px_30px_rgba(0,15,35,0.4)]">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_24px_rgba(0,180,216,0.4)] text-white mb-2">
          <Waves className="h-8 w-8 text-white" />
        </div>
        <h3 className="mt-4 text-base font-extrabold text-cyan-100">Khu Vực Xem Trước Khung Overlay (Ocean View)</h3>
        <p className="mt-1.5 text-xs text-cyan-300/60 max-w-md font-medium leading-relaxed">
          Tải ảnh lên ở khung bên trái và bấm &quot;Start AI Design&quot; để thưởng thức khung overlay được bóc tách viền sắc nét trên nền giao diện đại dương.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-cyan-500/30 bg-[#072244]/80 backdrop-blur-md p-4 shadow-[0_8px_30px_rgba(0,15,35,0.5)]">
      {/* Header controls: Modes & Zoom */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-cyan-500/20">
        <div className="flex items-center gap-1 rounded-xl border border-cyan-500/20 bg-[#051c3b]/80 p-1">
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              viewMode === 'split'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_12px_rgba(0,180,216,0.4)]'
                : 'text-cyan-200/70 hover:text-white'
            }`}
          >
            <Columns className="h-3.5 w-3.5" />
            Before / After
          </button>

          <button
            type="button"
            onClick={() => setViewMode('overlay')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              viewMode === 'overlay'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_12px_rgba(0,180,216,0.4)]'
                : 'text-cyan-200/70 hover:text-white'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Khung Trong Suốt
          </button>

          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              viewMode === 'side-by-side'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_12px_rgba(0,180,216,0.4)]'
                : 'text-cyan-200/70 hover:text-white'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            Song Song
          </button>

          <button
            type="button"
            onClick={() => setViewMode('obs-sim')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              viewMode === 'obs-sim'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_12px_rgba(0,180,216,0.4)]'
                : 'text-cyan-200/70 hover:text-white'
            }`}
          >
            <Tv className="h-3.5 w-3.5" />
            Giả Lập OBS
          </button>
        </div>

        {/* Canvas Toolbar: Zoom & Background mode toggle */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 rounded-xl border border-cyan-500/20 bg-[#051c3b]/80 p-1">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
              className="rounded p-1 text-cyan-300 hover:bg-cyan-900/50 transition-colors"
              title="Thu nhỏ"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-[42px] text-center font-mono text-[11px] font-bold text-cyan-200">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(3.0, z + 0.25))}
              className="rounded p-1 text-cyan-300 hover:bg-cyan-900/50 transition-colors"
              title="Phóng to"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="rounded p-1 text-cyan-300 hover:bg-cyan-900/50 transition-colors"
              title="Reset Zoom"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Background pills */}
          <div className="flex items-center gap-1 rounded-xl border border-cyan-500/20 bg-[#051c3b]/80 p-1">
            <button
              onClick={() => setCanvasBg('ocean')}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                canvasBg === 'ocean'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_10px_rgba(0,180,216,0.5)]'
                  : 'text-cyan-300/70 hover:text-white'
              }`}
              title="Nền Xanh Đại Dương"
            >
              🌊 Đại Dương
            </button>
            <button
              onClick={() => setCanvasBg('checker')}
              className={`rounded-lg px-2 py-1 text-xs font-semibold transition-all ${
                canvasBg === 'checker'
                  ? 'bg-cyan-900 text-white shadow-xs'
                  : 'text-cyan-300/70 hover:text-white'
              }`}
              title="Nền Caro Trong Suốt"
            >
              Caro Sáng
            </button>
            <button
              onClick={() => setCanvasBg('checker-dark')}
              className={`rounded-lg px-2 py-1 text-xs font-semibold transition-all ${
                canvasBg === 'checker-dark'
                  ? 'bg-cyan-900 text-white shadow-xs'
                  : 'text-cyan-300/70 hover:text-white'
              }`}
              title="Nền Caro Tối"
            >
              Caro Tối
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className={`relative h-[440px] w-full overflow-hidden rounded-2xl border border-cyan-500/30 select-none ${
          canvasBg === 'ocean'
            ? 'bg-ocean-blue shadow-[inset_0_0_40px_rgba(0,0,0,0.6)]'
            : canvasBg === 'checker-dark'
            ? 'checkerboard-dark'
            : canvasBg === 'black'
            ? 'bg-[#020b18]'
            : 'checkerboard-pattern'
        } flex items-center justify-center transition-colors duration-200`}
      >
        <div
          className="relative transition-transform duration-75 flex items-center justify-center max-h-full max-w-full"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* VIEW MODE 1: SPLIT SLIDER (BEFORE / AFTER) */}
          {viewMode === 'split' && (
            <div className="relative max-h-[400px] max-w-[700px] overflow-hidden rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-cyan-500/30">
              {/* Processed Overlay (Bottom Layer) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={outputUrl || originalUrl || ''}
                alt="After overlay"
                className="max-h-[400px] w-auto object-contain block drop-shadow-2xl"
                draggable={false}
              />

              {/* Original Image (Top Layer, clipped by sliderPosition) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${sliderPosition}%` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={originalUrl || outputUrl || ''}
                  alt="Before original"
                  className="max-h-[400px] max-w-none object-contain block"
                  draggable={false}
                  style={{
                    width: containerRef.current ? containerRef.current.clientWidth : '100%'
                  }}
                />
              </div>

              {/* Slider Handle */}
              <div
                onMouseDown={handleMouseDown}
                className="absolute top-0 bottom-0 z-30 w-1 bg-cyan-400 cursor-ew-resize shadow-[0_0_12px_rgba(0,180,216,0.9)]"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-[0_0_15px_rgba(0,180,216,0.8)] border-2 border-white">
                  <Columns className="h-4 w-4" />
                </div>
              </div>

              {/* Labels */}
              <div className="absolute top-2.5 left-2.5 z-20 rounded-md bg-black/80 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-md border border-white/20">
                Before (Gốc)
              </div>
              <div className="absolute top-2.5 right-2.5 z-20 rounded-md bg-cyan-950/80 px-2 py-0.5 text-[10px] font-bold text-cyan-300 uppercase tracking-wider backdrop-blur-md border border-cyan-400/30">
                After (Overlay Alpha)
              </div>
            </div>
          )}

          {/* VIEW MODE 2: ISOLATED TRANSPARENT OVERLAY */}
          {viewMode === 'overlay' && (
            <div className="relative max-h-[400px] max-w-[700px] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={outputUrl || originalUrl || ''}
                alt="Transparent Overlay"
                className="max-h-[400px] w-auto object-contain drop-shadow-[0_0_30px_rgba(0,180,216,0.35)]"
                draggable={false}
              />
            </div>
          )}

          {/* VIEW MODE 3: SIDE BY SIDE */}
          {viewMode === 'side-by-side' && (
            <div className="flex items-center gap-4 p-2">
              <div className="relative rounded-xl border border-cyan-500/30 bg-[#04152d]/90 p-1.5 shadow-lg">
                <span className="absolute top-2 left-2 z-10 rounded bg-black/80 px-2 py-0.5 text-[10px] font-bold text-white">
                  GỐC
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={originalUrl || ''}
                  alt="Original"
                  className="max-h-[220px] w-auto object-contain"
                  draggable={false}
                />
              </div>

              <div className="relative rounded-xl border border-cyan-400/40 bg-transparent p-1.5 shadow-lg">
                <span className="absolute top-2 left-2 z-10 rounded bg-cyan-950/80 border border-cyan-400/30 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                  OVERLAY
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={outputUrl || ''}
                  alt="Processed"
                  className="max-h-[220px] w-auto object-contain drop-shadow-[0_0_15px_rgba(0,180,216,0.35)]"
                  draggable={false}
                />
              </div>
            </div>
          )}

          {/* VIEW MODE 4: OBS LIVE SIMULATION */}
          {viewMode === 'obs-sim' && (
            <div className="relative h-[360px] w-[640px] overflow-hidden rounded-xl bg-[#020b18] shadow-2xl border border-cyan-500/40">
              {/* Simulated Game Backdrop */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#031b38] via-[#052b57] to-[#011429] flex flex-col justify-between p-4">
                <div className="flex items-center justify-between text-cyan-300 text-xs">
                  <span className="font-mono">OBS Studio Live Preview • 1920×1080 60FPS</span>
                  <span className="rounded bg-red-600/90 text-white font-bold px-2 py-0.5 text-[10px] shadow-sm">
                    LIVE STREAMING
                  </span>
                </div>
                <div className="text-center text-cyan-400/60 text-xs font-semibold">
                  [Simulated Gameplay / Video Stream Viewport]
                </div>
                <div className="flex items-center justify-between text-cyan-300/80 text-xs font-mono">
                  <span>Chat: Active</span>
                  <span>Bitrate: 8000 Kbps</span>
                </div>
              </div>

              {/* The Transparent Overlay Rendered on Top */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={outputUrl || originalUrl || ''}
                  alt="Overlay in OBS Simulation"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quality Assessment & Palette Bar */}
      {report && (
        <div className="grid grid-cols-1 gap-3 rounded-xl border border-cyan-500/25 bg-[#051c3b]/70 p-3.5 sm:grid-cols-4">
          {/* Quality Score */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white font-extrabold text-sm shadow-[0_0_15px_rgba(0,180,216,0.4)]">
              {report.quality_score}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300/70">
                Quality Score
              </span>
              <p className="text-xs font-bold text-white">
                {report.quality_score >= 95 ? 'Hoàn Hảo (Grade A+)' : 'Chuẩn Xuất OBS'}
              </p>
            </div>
          </div>

          {/* Transparency */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300/70">
              Độ Trong Suốt (Alpha)
            </span>
            <p className="text-xs font-bold text-cyan-200 font-mono">
              {report.transparency_percentage}% Alpha Clean
            </p>
          </div>

          {/* Dimensions */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300/70">
              Kích Thước Đầu Ra
            </span>
            <p className="text-xs font-bold text-cyan-200 font-mono">
              {report.dimensions.width} × {report.dimensions.height} px (RGBA)
            </p>
          </div>

          {/* Extracted Palette Swatches */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300/70">
              Bảng Màu Bóc Tách
            </span>
            <div className="mt-1 flex items-center gap-1.5">
              {report.palette.slice(0, 6).map((hex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => copyToClipboard(hex)}
                  title={`Click để copy ${hex}`}
                  className="group relative h-5 w-5 rounded-md border border-white/20 transition-transform hover:scale-125 shadow-xs"
                  style={{ backgroundColor: hex }}
                >
                  {copiedHex === hex && (
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 rounded bg-cyan-900 border border-cyan-400 px-1 text-[9px] text-cyan-200">
                      Copied!
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Warnings if any */}
      {report?.warnings && report.warnings.length > 0 && (
        <div className="flex items-start gap-2.5 rounded-xl bg-amber-950/60 p-3 text-xs text-amber-200 border border-amber-500/40">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
          <div>
            {report.warnings.map((w, i) => (
              <p key={i}>{w}</p>
            ))}
          </div>
        </div>
      )}

      {/* Main Download & Action Center */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isProcessing}
            className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-[#051c3b]/80 px-3.5 py-2.5 text-xs font-bold text-cyan-200 hover:border-cyan-400 hover:text-white transition-all shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
            Regenerate Design (Tạo Lại)
          </button>

          <button
            type="button"
            onClick={onSaveToMemory}
            disabled={isProcessing}
            className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-[#051c3b]/80 px-3.5 py-2.5 text-xs font-bold text-cyan-200 hover:border-cyan-400 hover:text-white transition-all shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            Lưu Vào Style Memory
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadOBSPackage}
            className="rounded-xl border border-cyan-500/30 bg-[#061e3d]/80 px-3.5 py-2.5 text-xs font-bold text-cyan-200 hover:bg-[#0a2f5c] transition-all"
          >
            OBS Config (JSON)
          </button>

          <button
            type="button"
            onClick={handleDownloadPNG}
            className="btn-ocean-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-extrabold text-white shadow-[0_0_20px_rgba(0,180,216,0.4)] transition-all"
          >
            <Download className="h-4 w-4" />
            Download Transparent PNG (RGBA)
          </button>
        </div>
      </div>
    </div>
  );
};
