'use client';

import React, { useState, useRef } from 'react';
import { Sparkles, Upload, Trash2, ArrowRight, Palette, Layers, Check, Waves } from 'lucide-react';
import { StyleProfile } from '@/lib/types';

interface StyleMemoryViewProps {
  profiles: StyleProfile[];
  onProfilesUpdated: () => void;
  onApplyProfile: (profileId: string) => void;
}

export const StyleMemoryView: React.FC<StyleMemoryViewProps> = ({
  profiles,
  onProfilesUpdated,
  onApplyProfile
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [profileName, setProfileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadAndAnalyze = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'style_reference');

      // Upload file
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();
      if (!uploadData.success) {
        throw new Error(uploadData.error);
      }

      // Create Style Memory
      const res = await fetch('/api/style-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileName.trim() || `Profile (${file.name})`,
          referenceImageUrl: uploadData.url,
          referenceImagePath: uploadData.path
        })
      });
      const data = await res.json();
      if (data.success) {
        setProfileName('');
        onProfilesUpdated();
        alert('Đã phân tích và lưu hồ sơ phong cách mới vào Style Reference Memory!');
      } else {
        alert(`Lỗi tạo hồ sơ: ${data.error}`);
      }
    } catch (e: any) {
      alert(`Lỗi: ${e.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa hồ sơ phong cách này?')) return;
    try {
      const res = await fetch(`/api/style-memory?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onProfilesUpdated();
      }
    } catch (e: any) {
      alert(`Lỗi xóa: ${e.message}`);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
            <Waves className="h-5 w-5 text-cyan-400" />
            HỒ SƠ PHONG CÁCH THAM CHIẾU (OCEAN STYLE MEMORY)
          </h2>
          <p className="mt-1 text-xs text-cyan-300/60 font-medium">
            Lưu trữ đặc trưng thẩm mỹ (màu sắc, viền khung, hiệu ứng kim loại, ánh sáng neon) từ các mẫu thiết kế của bạn.
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="btn-ocean-primary flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-[0_0_15px_rgba(0,180,216,0.4)] transition-all"
        >
          <Upload className="h-4 w-4" />
          {isUploading ? 'Đang phân tích...' : '+ Thêm Ảnh Mẫu Mới'}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files?.[0]) handleUploadAndAnalyze(e.target.files[0]);
          }}
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
        />
      </div>

      {/* Grid of Profiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {profiles.map((p) => (
          <div
            key={p.id}
            className="flex flex-col justify-between rounded-2xl border border-cyan-500/30 bg-[#072244]/80 backdrop-blur-md p-4 shadow-[0_8px_30px_rgba(0,15,35,0.5)] transition-all hover:border-cyan-400 hover:shadow-[0_12px_35px_rgba(0,180,216,0.2)]"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">{p.name}</h3>
                  <span className="text-[11px] font-semibold text-cyan-300/70">{p.theme}</span>
                </div>
                <button
                  onClick={() => handleDelete(p.id)}
                  title="Xóa hồ sơ"
                  className="rounded-lg p-1.5 text-cyan-400/60 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {p.referenceImageUrl && (
                <div className="mt-3 aspect-video w-full overflow-hidden rounded-xl bg-[#031326] flex items-center justify-center border border-cyan-500/20 shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.referenceImageUrl}
                    alt={p.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}

              <p className="mt-3 text-xs text-cyan-200/80 leading-relaxed line-clamp-2">
                {p.aesthetic}
              </p>

              {/* Palette */}
              <div className="mt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300/60">
                  Bảng Màu Đặc Trưng:
                </span>
                <div className="mt-1.5 flex items-center gap-1.5">
                  {p.palette.slice(0, 5).map((c, i) => (
                    <span
                      key={i}
                      title={`${c.hex} (${c.percentage}%)`}
                      className="h-5 w-5 rounded-md border border-white/20 inline-block shadow-xs"
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                  <div
                    className="ml-auto flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-lg border border-cyan-500/30 bg-[#04152d]"
                    style={{ color: p.dominantGlowColor }}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.dominantGlowColor }} />
                    Glow
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-cyan-500/20">
              <button
                type="button"
                onClick={() => onApplyProfile(p.id)}
                className="btn-ocean-primary flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white shadow-[0_0_15px_rgba(0,180,216,0.3)] transition-all"
              >
                Sử Dụng Phong Cách Này <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
