'use client';

import React, { useState } from 'react';
import { Key, Server, CheckCircle2, XCircle, Loader2, ShieldCheck, Eye, EyeOff, Sparkles, RefreshCw, Waves } from 'lucide-react';
import { AIProviderType, ClientSafeConfig } from '@/lib/types';

interface SettingsViewProps {
  config: ClientSafeConfig | null;
  onConfigUpdated: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ config, onConfigUpdated }) => {
  const [provider, setProvider] = useState<AIProviderType>(config?.activeProvider || 'local');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [endpoint, setEndpoint] = useState(config?.customEndpoint || '');
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs: number;
    modelChecked?: string;
  } | null>(null);

  const handleProviderChange = (newProvider: AIProviderType) => {
    setProvider(newProvider);
    setTestResult(null);
    setApiKey('');
    if (newProvider === 'gemini') {
      setModel(config?.geminiModel || 'gemini-1.5-flash');
    } else if (newProvider === 'openai') {
      setModel(config?.openaiModel || 'gpt-4o');
    } else if (newProvider === 'custom') {
      setModel(config?.customModel || 'gpt-4o');
      setEndpoint(config?.customEndpoint || '');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload: any = { activeProvider: provider };
      if (provider === 'gemini') {
        if (apiKey) payload.geminiApiKey = apiKey;
        if (model) payload.geminiModel = model;
      } else if (provider === 'openai') {
        if (apiKey) payload.openaiApiKey = apiKey;
        if (model) payload.openaiModel = model;
      } else if (provider === 'replicate') {
        if (apiKey) payload.replicateApiKey = apiKey;
      } else if (provider === 'custom') {
        if (apiKey) payload.customApiKey = apiKey;
        if (model) payload.customModel = model;
        if (endpoint) payload.customEndpoint = endpoint;
      }

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        onConfigUpdated();
        alert('Cài đặt API đã được lưu an toàn trên máy chủ!');
      } else {
        alert(`Lỗi khi lưu cài đặt: ${data.error}`);
      }
    } catch (e: any) {
      alert(`Lỗi lưu cấu hình: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey: apiKey || undefined,
          model: model || undefined,
          endpoint: endpoint || undefined
        })
      });
      const data = await res.json();
      setTestResult(data.testResult);
    } catch (e: any) {
      setTestResult({
        success: false,
        message: e.message,
        latencyMs: 0
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Title */}
      <div className="border-b border-cyan-500/20 pb-4">
        <h2 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
          <Key className="h-5 w-5 text-cyan-400" />
          CÀI ĐẶT AI API & PROVIDER ADAPTER (OCEAN STUDIO)
        </h2>
        <p className="mt-1 text-xs text-cyan-300/60 font-medium">
          Cấu hình nhà cung cấp trí tuệ nhân tạo để phân tích hình ảnh chuyên sâu và tối ưu hóa thiết kế khung overlay.
        </p>
      </div>

      {/* Provider Selector Cards */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        {/* Local Neural Engine */}
        <button
          type="button"
          onClick={() => handleProviderChange('local')}
          className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
            provider === 'local'
              ? 'border-cyan-400 bg-gradient-to-br from-[#0077b6] to-[#023e8a] text-white shadow-[0_0_20px_rgba(0,180,216,0.4)]'
              : 'border-cyan-500/25 bg-[#061e3d]/70 text-cyan-100 hover:border-cyan-400 hover:bg-[#092b52]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-white">Local Neural Engine</span>
              <span className="rounded-full bg-cyan-950 border border-cyan-400/40 text-cyan-300 px-2 py-0.5 text-[10px] font-bold uppercase shadow-sm">
                Free / Built-in
              </span>
            </div>
            <p className={`mt-2 text-xs leading-relaxed ${provider === 'local' ? 'text-cyan-100' : 'text-cyan-300/60'}`}>
              Sử dụng Rembg U2-Net và OpenCV tích hợp sẵn trên máy. Hoạt động 100% offline, không tốn phí token.
            </p>
          </div>
          <span className="mt-3 text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-cyan-300" /> Sẵn sàng kích hoạt
          </span>
        </button>

        {/* Google Gemini */}
        <button
          type="button"
          onClick={() => handleProviderChange('gemini')}
          className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
            provider === 'gemini'
              ? 'border-cyan-400 bg-gradient-to-br from-[#0077b6] to-[#023e8a] text-white shadow-[0_0_20px_rgba(0,180,216,0.4)]'
              : 'border-cyan-500/25 bg-[#061e3d]/70 text-cyan-100 hover:border-cyan-400 hover:bg-[#092b52]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-white">Google Gemini</span>
              <span className="rounded-full bg-cyan-950 border border-cyan-400/40 text-cyan-300 px-2 py-0.5 text-[10px] font-bold">
                Multimodal Vision
              </span>
            </div>
            <p className={`mt-2 text-xs leading-relaxed ${provider === 'gemini' ? 'text-cyan-100' : 'text-cyan-300/60'}`}>
              Phân tích màu sắc, phong cách gaming và cấu trúc hình học cực kỳ nhạy bén với Gemini Flash/Pro.
            </p>
          </div>
          <span className="mt-3 text-[11px] text-cyan-300 font-medium">
            {config?.hasGeminiKey ? '✓ Đã lưu API Key' : 'Chưa nhập API Key'}
          </span>
        </button>

        {/* OpenAI GPT-4o */}
        <button
          type="button"
          onClick={() => handleProviderChange('openai')}
          className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
            provider === 'openai'
              ? 'border-cyan-400 bg-gradient-to-br from-[#0077b6] to-[#023e8a] text-white shadow-[0_0_20px_rgba(0,180,216,0.4)]'
              : 'border-cyan-500/25 bg-[#061e3d]/70 text-cyan-100 hover:border-cyan-400 hover:bg-[#092b52]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-white">OpenAI GPT-4o</span>
              <span className="rounded-full bg-cyan-950 border border-cyan-400/40 text-cyan-300 px-2 py-0.5 text-[10px] font-bold">
                Vision & Inpaint
              </span>
            </div>
            <p className={`mt-2 text-xs leading-relaxed ${provider === 'openai' ? 'text-cyan-100' : 'text-cyan-300/60'}`}>
              Khả năng nhận diện chi tiết đồ họa phức tạp và phân tích prompt tái tạo thiết kế chuẩn xác.
            </p>
          </div>
          <span className="mt-3 text-[11px] text-cyan-300 font-medium">
            {config?.hasOpenaiKey ? '✓ Đã lưu API Key' : 'Chưa nhập API Key'}
          </span>
        </button>
      </div>

      {/* Provider Details Form */}
      <div className="rounded-2xl border border-cyan-500/30 bg-[#072244]/80 backdrop-blur-md p-6 shadow-[0_8px_30px_rgba(0,15,35,0.5)] space-y-4">
        {provider === 'local' ? (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="h-4 w-4 text-cyan-400" />
              Cấu Hình Local Neural Engine
            </h3>
            <p className="text-xs text-cyan-200/80 leading-relaxed">
              Công cụ Local đang sử dụng bộ thư viện Rembg AI (U2-Net) cùng OpenCV và Sharp để xử lý toàn bộ quá trình bóc tách kênh Alpha, viền neon và độ sâu đổ bóng trực tiếp trên máy tính của bạn.
            </p>
            <div className="rounded-xl bg-[#04152d] p-3.5 text-xs text-cyan-300 border border-cyan-500/30 font-mono shadow-inner">
              Trạng thái: Hoạt động cục bộ • Không gửi ảnh lên cloud • Zero Latency API
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="h-4 w-4 text-cyan-400" />
              Thông Tin Xác Thực API ({provider.toUpperCase()})
            </h3>

            {/* API Key Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-cyan-100">
                API Key:
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={
                    provider === 'gemini'
                      ? config?.maskedKeys.gemini || 'Nhập Gemini API Key (AIzaSy...)'
                      : provider === 'openai'
                      ? config?.maskedKeys.openai || 'Nhập OpenAI API Key (sk-...)'
                      : 'Nhập API Token'
                  }
                  className="w-full rounded-xl border border-cyan-500/30 bg-[#04152d] px-3.5 py-2.5 text-xs font-mono text-cyan-100 focus:border-cyan-400 focus:outline-none pr-10 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-white"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[11px] text-cyan-300/50">
                Để trống nếu muốn giữ nguyên API Key hiện tại đã lưu trên máy chủ.
              </p>
            </div>

            {/* Model Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-cyan-100">
                Model:
              </label>
              {provider === 'gemini' ? (
                <select
                  value={model || config?.geminiModel || 'gemini-1.5-flash'}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full rounded-xl border border-cyan-500/30 bg-[#04152d] px-3.5 py-2.5 text-xs font-bold text-cyan-100 focus:border-cyan-400 focus:outline-none"
                >
                  <option value="gemini-1.5-flash">gemini-1.5-flash (Nhanh & Tối ưu)</option>
                  <option value="gemini-2.0-flash">gemini-2.0-flash (Thế hệ mới nhất)</option>
                  <option value="gemini-1.5-pro">gemini-1.5-pro (Độ chính xác cao nhất)</option>
                </select>
              ) : provider === 'openai' ? (
                <select
                  value={model || config?.openaiModel || 'gpt-4o'}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full rounded-xl border border-cyan-500/30 bg-[#04152d] px-3.5 py-2.5 text-xs font-bold text-cyan-100 focus:border-cyan-400 focus:outline-none"
                >
                  <option value="gpt-4o">gpt-4o (Vision thông minh nhất)</option>
                  <option value="gpt-4o-mini">gpt-4o-mini (Nhanh & Tiết kiệm chi phí)</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="custom-model-id"
                  className="w-full rounded-xl border border-cyan-500/30 bg-[#04152d] px-3.5 py-2.5 text-xs font-bold text-cyan-100 focus:border-cyan-400 focus:outline-none"
                />
              )}
            </div>

            {/* Custom Endpoint if custom */}
            {provider === 'custom' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-cyan-100">
                  Custom Base URL Endpoint:
                </label>
                <input
                  type="text"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="https://api.your-service.com/v1"
                  className="w-full rounded-xl border border-cyan-500/30 bg-[#04152d] px-3.5 py-2.5 text-xs font-mono text-cyan-100 focus:border-cyan-400 focus:outline-none"
                />
              </div>
            )}
          </div>
        )}

        {/* Test Connection Result Box */}
        {testResult && (
          <div
            className={`flex items-start gap-3 rounded-xl p-3.5 text-xs border ${
              testResult.success
                ? 'bg-emerald-950/70 text-emerald-200 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'bg-red-950/70 text-red-200 border-red-500/40'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <span className="font-bold">
                {testResult.success ? 'Kết nối thành công!' : 'Kết nối thất bại:'}
              </span>
              <p>{testResult.message}</p>
              {testResult.latencyMs > 0 && (
                <p className="font-mono text-[10px] text-cyan-400">
                  Độ trễ phản hồi: {testResult.latencyMs}ms
                </p>
              )}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-cyan-500/20">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-[#051c3b]/80 px-4 py-2.5 text-xs font-bold text-cyan-200 hover:border-cyan-400 hover:text-white transition-all shadow-sm"
          >
            {isTesting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5 text-cyan-400" />}
            Test API Connection (Kiểm Tra Kết Nối)
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="btn-ocean-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-extrabold text-white shadow-[0_0_20px_rgba(0,180,216,0.4)] transition-all"
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
            Lưu Cấu Hình An Toàn
          </button>
        </div>
      </div>

      {/* Security Assurance Notice */}
      <div className="rounded-2xl border border-cyan-500/25 bg-[#051833]/80 backdrop-blur-md p-4 text-xs text-cyan-200/80 space-y-1">
        <h4 className="font-bold text-white flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-cyan-400" />
          Bảo Mật API Key Phía Máy Chủ (Server-Side Guard)
        </h4>
        <p>
          Mọi API Key được mã hóa và lưu trữ an toàn trong tập tin cấu hình máy chủ của ứng dụng. Tuyệt đối không để lộ trong mã nguồn frontend, thẻ meta hay mạng inspect của trình duyệt web.
        </p>
      </div>
    </div>
  );
};
