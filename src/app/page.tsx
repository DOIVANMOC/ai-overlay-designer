'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { UploadDropzone } from '@/components/UploadDropzone';
import { StyleReferenceSelector } from '@/components/StyleReferenceSelector';
import { EffectControls } from '@/components/EffectControls';
import { PipelineStepper, PipelineStep } from '@/components/PipelineStepper';
import { PreviewCanvas } from '@/components/PreviewCanvas';
import { SettingsView } from '@/components/SettingsView';
import { StyleMemoryView } from '@/components/StyleMemoryView';
import { HistoryView } from '@/components/HistoryView';
import {
  ClientSafeConfig,
  StyleProfile,
  HistoryItem,
  OverlayProcessingOptions,
  QualityReport,
  AnalysisResult
} from '@/lib/types';
import { Play, RefreshCw, Waves } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'studio' | 'memory' | 'history' | 'settings'>('studio');

  // Config & Data state
  const [config, setConfig] = useState<ClientSafeConfig | null>(null);
  const [profiles, setProfiles] = useState<StyleProfile[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Studio Selection state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImagePath, setSelectedImagePath] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number; filename: string } | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');

  // Processing & Options state
  const [options, setOptions] = useState<OverlayProcessingOptions>({
    glowIntensity: 35,
    glowColor: '#00e5ff',
    shadowIntensity: 40,
    neonBoost: 15,
    metallicBoost: 15,
    edgeFeather: 2,
    resolution: 'original',
    hollowCenter: false,
    backgroundColor: 'ocean'
  });

  // Pipeline execution state
  const [currentStep, setCurrentStep] = useState<PipelineStep>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Result output state
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [report, setReport] = useState<QualityReport | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  // Initial data loading
  useEffect(() => {
    fetchConfig();
    fetchProfiles();
    fetchHistory();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) setConfig(data.config);
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  };

  const fetchProfiles = async () => {
    try {
      const res = await fetch('/api/style-memory');
      const data = await res.json();
      if (data.success) setProfiles(data.profiles);
    } catch (e) {
      console.error('Failed to load style profiles:', e);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (data.success) setHistory(data.history);
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  };

  const handleImageSelected = (url: string, path?: string, meta?: { width: number; height: number; filename: string }) => {
    setSelectedImage(url);
    if (path) setSelectedImagePath(path);
    if (meta) setImageMeta(meta);
    setOutputUrl(null);
    setReport(null);
    setCurrentStep('idle');
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setSelectedImagePath(null);
    setImageMeta(null);
    setOutputUrl(null);
    setReport(null);
    setCurrentStep('idle');
  };

  const handleOptionsChange = (updated: Partial<OverlayProcessingOptions>) => {
    setOptions((prev) => ({ ...prev, ...updated }));
  };

  // MAIN 5-STEP AI SYNTHESIS PIPELINE
  const handleStartAIDesign = async () => {
    if (!selectedImage) {
      alert('Vui lòng tải lên một hình ảnh trước khi bắt đầu tạo khung overlay!');
      return;
    }

    setIsProcessing(true);
    setOutputUrl(null);
    setReport(null);

    try {
      // BƯỚC 1: PHÂN TÍCH HÌNH ẢNH GỐC
      setCurrentStep(1);
      setStatusMessage('AI đang phân tích phong cách thiết kế, bố cục, bảng màu và viền khung...');

      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: selectedImage,
          imagePath: selectedImagePath,
          styleProfileId: selectedProfileId || undefined
        })
      });

      const analyzeData = await analyzeRes.json();
      if (!analyzeData.success) {
        throw new Error(analyzeData.error || 'Phân tích hình ảnh thất bại');
      }

      const extractedAnalysis: AnalysisResult = analyzeData.analysis;
      setAnalysis(extractedAnalysis);

      // Auto harmonize options with detected style if not overridden
      let currentOptions = { ...options };
      if (extractedAnalysis.suggested_settings) {
        currentOptions = {
          ...currentOptions,
          glowColor: extractedAnalysis.dominantGlowColor || extractedAnalysis.suggested_settings.glow_color || currentOptions.glowColor,
          glowIntensity: Math.max(currentOptions.glowIntensity, extractedAnalysis.suggested_settings.glow_intensity || 30),
          metallicBoost: extractedAnalysis.suggested_settings.metallic_boost || currentOptions.metallicBoost,
          neonBoost: extractedAnalysis.suggested_settings.neon_boost || currentOptions.neonBoost
        };
        setOptions(currentOptions);
      }

      // BƯỚC 2: TÁCH VÀ XỬ LÝ NỀN
      setCurrentStep(2);
      setStatusMessage('Đang tách khung chính khỏi nền gốc, bảo toàn chi tiết viền mảnh...');

      // BƯỚC 3 & 4: TÁI TẠO KHUNG & BỔ SUNG HIỆU ỨNG
      setCurrentStep(3);
      setStatusMessage('Tái tạo cấu trúc khung, hòa phối Outer Glow, Drop Shadow và Metallic Bevel...');

      const processRes = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: selectedImage,
          imagePath: selectedImagePath,
          title: imageMeta?.filename?.replace(/\.[^/.]+$/, '') || extractedAnalysis.theme || 'AI Stream Overlay',
          options: {
            ...currentOptions,
            styleProfileId: selectedProfileId || undefined
          }
        })
      });

      const processData = await processRes.json();
      if (!processData.success) {
        throw new Error(processData.error || 'Xử lý khung overlay thất bại');
      }

      // BƯỚC 5: KIỂM TRA CHẤT LƯỢNG & ALPHA
      setCurrentStep(5);
      setStatusMessage('Kiểm tra răng cưa, xác thực kênh Alpha trong suốt và tối ưu hóa RGBA...');

      await new Promise((resolve) => setTimeout(resolve, 600));

      // HOÀN THÀNH
      setCurrentStep('done');
      setStatusMessage('Khung Overlay hoàn chỉnh đã sẵn sàng!');
      setOutputUrl(processData.outputUrl);
      setReport(processData.report);

      // Refresh history
      fetchHistory();
    } catch (err: any) {
      console.error('Pipeline error:', err);
      setCurrentStep('error');
      setStatusMessage(`Lỗi trong quá trình xử lý: ${err.message}`);
      alert(`Đã xảy ra lỗi: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToMemory = async () => {
    if (!outputUrl) return;
    try {
      const name = prompt('Nhập tên cho hồ sơ phong cách mới (Style Memory):', analysis?.theme || 'Custom Stream Style');
      if (!name) return;

      const res = await fetch('/api/style-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          referenceImageUrl: outputUrl
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchProfiles();
        alert('Đã lưu thành công phong cách này vào Style Reference Memory!');
      } else {
        alert(`Lỗi: ${data.error}`);
      }
    } catch (e: any) {
      alert(`Lỗi: ${e.message}`);
    }
  };

  const handleLoadHistoryItem = (item: HistoryItem) => {
    setSelectedImage(item.originalUrl);
    setOutputUrl(item.outputUrl);
    setOptions(item.options);
    setReport({
      success: true,
      dimensions: item.dimensions,
      transparency_percentage: item.transparencyPercentage,
      palette: item.palette,
      quality_score: item.qualityScore,
      warnings: [],
      effects_applied: {
        glow: item.options.glowIntensity > 0,
        glow_color: item.options.glowColor,
        glow_intensity: item.options.glowIntensity,
        shadow: item.options.shadowIntensity > 0,
        shadow_intensity: item.options.shadowIntensity,
        neon_boost: item.options.neonBoost,
        metallic_boost: item.options.metallicBoost
      }
    });
    setCurrentStep('done');
    setActiveTab('studio');
  };

  const handleApplyProfileFromMemory = (profileId: string) => {
    setSelectedProfileId(profileId);
    const p = profiles.find((item) => item.id === profileId);
    if (p) {
      setOptions((prev) => ({
        ...prev,
        glowColor: p.dominantGlowColor,
        glowIntensity: p.glowIntensity,
        shadowIntensity: p.shadowIntensity,
        metallicBoost: p.metallicBoost,
        neonBoost: p.neonBoost
      }));
    }
    setActiveTab('studio');
  };

  return (
    <div className="min-h-screen ocean-ambient-bg text-cyan-50 flex flex-col font-sans">
      {/* Ocean Studio Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        config={config}
        historyCount={history.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* TAB 1: STUDIO WORKSPACE */}
        {activeTab === 'studio' && (
          <div className="space-y-6">
            {/* Top Pipeline Stepper (Visible when active) */}
            <PipelineStepper currentStep={currentStep} statusMessage={statusMessage} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* LEFT COLUMN: UPLOAD & CONFIGURATION (5 cols) */}
              <div className="space-y-6 lg:col-span-5">
                {/* 1. Target Upload Box */}
                <UploadDropzone
                  onImageSelected={handleImageSelected}
                  selectedImage={selectedImage}
                  imageMeta={imageMeta}
                  onClear={handleClearImage}
                  isProcessing={isProcessing}
                />

                {/* 2. Style Reference Memory */}
                <StyleReferenceSelector
                  profiles={profiles}
                  selectedProfileId={selectedProfileId}
                  onSelectProfile={(id) => setSelectedProfileId(id)}
                  onReferenceUploaded={() => fetchProfiles()}
                  disabled={isProcessing}
                />

                {/* 3. Effect Controls */}
                <EffectControls
                  options={options}
                  onChange={handleOptionsChange}
                  detectedPalette={report?.palette}
                  disabled={isProcessing}
                />

                {/* Primary Action Button (Glowing Ocean Button) */}
                <button
                  type="button"
                  onClick={handleStartAIDesign}
                  disabled={isProcessing || !selectedImage}
                  className={`btn-ocean-primary flex w-full items-center justify-center gap-2.5 rounded-2xl py-4 text-sm font-extrabold transition-all shadow-[0_0_25px_rgba(0,180,216,0.4)] ${
                    isProcessing || !selectedImage
                      ? 'opacity-40 cursor-not-allowed filter grayscale'
                      : 'hover:scale-[1.01] active:scale-[0.99]'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin text-white" />
                      AI Đang Xử Lý Khung...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-white text-white" />
                      Start AI Design (Bắt Đầu Tạo Khung Tự Động)
                    </>
                  )}
                </button>
              </div>

              {/* RIGHT COLUMN: PREVIEW & EXPORT (7 cols) */}
              <div className="space-y-6 lg:col-span-7">
                <PreviewCanvas
                  originalUrl={selectedImage}
                  outputUrl={outputUrl}
                  report={report}
                  themeName={analysis?.theme}
                  onRegenerate={handleStartAIDesign}
                  onSaveToMemory={handleSaveToMemory}
                  isProcessing={isProcessing}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STYLE REFERENCE MEMORY */}
        {activeTab === 'memory' && (
          <StyleMemoryView
            profiles={profiles}
            onProfilesUpdated={fetchProfiles}
            onApplyProfile={handleApplyProfileFromMemory}
          />
        )}

        {/* TAB 3: HISTORY */}
        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onHistoryUpdated={fetchHistory}
            onLoadHistoryItem={handleLoadHistoryItem}
          />
        )}

        {/* TAB 4: API SETTINGS */}
        {activeTab === 'settings' && (
          <SettingsView
            config={config}
            onConfigUpdated={fetchConfig}
          />
        )}
      </main>

      {/* Ocean Studio Footer */}
      <footer className="border-t border-cyan-500/20 bg-[#020b18]/90 backdrop-blur-md py-4 text-center text-xs text-cyan-300/60">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 font-medium">
            <Waves className="h-4 w-4 text-cyan-400" />
            AI OVERLAY DESIGNER © 2026 • Ocean Studio Professional Edition
          </span>
          <span className="font-mono text-[11px] text-cyan-400/50">
            Powered by Next.js, Sharp, OpenCV, Rembg & Multi-Model Vision AI
          </span>
        </div>
      </footer>
    </div>
  );
}
