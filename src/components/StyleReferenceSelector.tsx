'use client';

import React, { useRef, useState } from 'react';
import { Sparkles, Upload, Check, Info, Droplets } from 'lucide-react';
import { StyleProfile } from '@/lib/types';

interface StyleReferenceSelectorProps {
  profiles: StyleProfile[];
  selectedProfileId: string;
  onSelectProfile: (id: string) => void;
  onReferenceUploaded?: (url: string) => void;
  disabled?: boolean;
}

export const StyleReferenceSelector: React.FC<StyleReferenceSelectorProps> = ({
  profiles,
  selectedProfileId,
  onSelectProfile,
  onReferenceUploaded,
  disabled
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const refFileInputRef = useRef<HTMLInputElement>(null);

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);

  const handleRefUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'style_reference');

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();

      if (!uploadData.success) {
        throw new Error(uploadData.error);
      }

      // Automatically create a Style Memory profile from this uploaded reference image
      const memRes = await fetch('/api/style-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Custom Ref (${file.name})`,
          referenceImageUrl: uploadData.url,
          referenceImagePath: uploadData.path
        })
      });
      const memData = await memRes.json();
      if (memData.success && memData.profile) {
        onSelectProfile(memData.profile.id);
        if (onReferenceUploaded) onReferenceUploaded(uploadData.url);
      }
    } catch (err: any) {
      alert(`Style reference analysis error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3.5 rounded-2xl border border-cyan-500/30 bg-[#072244]/80 backdrop-blur-md p-4 shadow-[0_8px_30px_rgba(0,15,35,0.5)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Droplets className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-cyan-100">
            2. Style Reference Memory (Bộ Nhớ Phong Cách Tham Chiếu)
          </h3>
        </div>
        <span className="rounded-full bg-cyan-950 border border-cyan-400/40 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300 shadow-[0_0_8px_rgba(0,180,216,0.2)]">
          Style Match Guard
        </span>
      </div>

      <p className="text-xs text-cyan-300/60 font-medium">
        AI sẽ bám sát ngôn ngữ thiết kế, bảng màu và độ bóng của phong cách mẫu được chọn.
      </p>

      {/* Style Profile Selection Dropdown */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelectProfile('')}
          disabled={disabled}
          className={`flex items-start justify-between rounded-xl border p-3 text-left transition-all ${
            !selectedProfileId
              ? 'border-cyan-400 bg-gradient-to-r from-[#0077b6] to-[#023e8a] text-white shadow-[0_0_15px_rgba(0,180,216,0.35)]'
              : 'border-cyan-500/20 bg-[#061d3c]/70 text-cyan-200 hover:border-cyan-400 hover:bg-[#0a2b54]'
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5 font-bold text-xs text-white">
              <span>Auto-Detect from Target Image</span>
            </div>
            <p className={`mt-1 text-[11px] ${!selectedProfileId ? 'text-cyan-100' : 'text-cyan-300/60'}`}>
              Tự nhận diện màu sắc & phong cách trực tiếp từ ảnh gốc
            </p>
          </div>
          {!selectedProfileId && <Check className="h-4 w-4 shrink-0 text-white" />}
        </button>

        {profiles.map((p) => {
          const isSelected = selectedProfileId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectProfile(p.id)}
              disabled={disabled}
              className={`flex items-start justify-between rounded-xl border p-3 text-left transition-all ${
                isSelected
                  ? 'border-cyan-400 bg-gradient-to-r from-[#0077b6] to-[#023e8a] text-white shadow-[0_0_15px_rgba(0,180,216,0.35)]'
                  : 'border-cyan-500/20 bg-[#061d3c]/70 text-cyan-200 hover:border-cyan-400 hover:bg-[#0a2b54]'
              }`}
            >
              <div className="w-full pr-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs truncate text-white">{p.name}</span>
                  <div className="flex items-center gap-1">
                    {p.palette.slice(0, 3).map((c, i) => (
                      <span
                        key={i}
                        className="inline-block h-2.5 w-2.5 rounded-full border border-black/40 shadow-xs"
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                </div>
                <p className={`mt-1 text-[10px] line-clamp-1 ${isSelected ? 'text-cyan-100' : 'text-cyan-300/60'}`}>
                  {p.aesthetic}
                </p>
              </div>
              {isSelected && <Check className="h-4 w-4 shrink-0 text-white" />}
            </button>
          );
        })}
      </div>

      {/* Upload custom reference image */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => refFileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-cyan-500/40 bg-[#051c3b]/60 py-2.5 text-xs font-bold text-cyan-200 hover:border-cyan-400 hover:bg-[#082952] transition-all shadow-sm"
        >
          <Upload className="h-3.5 w-3.5 text-cyan-400" />
          {isUploading ? 'Đang phân tích phong cách mẫu...' : '+ Tải ảnh mẫu tham chiếu mới (Style Memory)'}
        </button>
        <input
          type="file"
          ref={refFileInputRef}
          onChange={(e) => {
            if (e.target.files?.[0]) handleRefUpload(e.target.files[0]);
          }}
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
        />
      </div>

      {/* Info notice about separation */}
      <div className="flex items-start gap-2.5 rounded-xl bg-[#04152d]/90 p-3 text-[11px] text-cyan-200/80 border border-cyan-500/20">
        <Info className="h-4 w-4 shrink-0 text-cyan-400 mt-0.5" />
        <p>
          Hệ thống đảm bảo <strong>Style Memory</strong> chỉ dùng làm hồ sơ tham chiếu đặc trưng thẩm mỹ, không nhầm lẫn với nội dung ảnh gốc cần tách.
        </p>
      </div>
    </div>
  );
};
