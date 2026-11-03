'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, Sparkles, Waves } from 'lucide-react';

interface UploadDropzoneProps {
  onImageSelected: (imageUrl: string, imagePath?: string, meta?: { width: number; height: number; filename: string }) => void;
  selectedImage: string | null;
  imageMeta: { width: number; height: number; filename: string } | null;
  onClear: () => void;
  isProcessing: boolean;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onImageSelected,
  selectedImage,
  imageMeta,
  onClear,
  isProcessing
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const samplePresets = [
    {
      name: 'Mecha Gold Chatbox',
      url: '/samples/sample_mecha_chatbox.png',
      width: 1100,
      height: 300,
      theme: 'Mecha Gold'
    },
    {
      name: 'Webcam 16:9 Frame',
      url: '/samples/sample_mecha_webcam.png',
      width: 1920,
      height: 1080,
      theme: 'Esports HUD'
    },
    {
      name: 'Gold Donate Bar',
      url: '/samples/sample_mecha_donate.png',
      width: 1200,
      height: 250,
      theme: 'Stream Ticker'
    }
  ];

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'target');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        onImageSelected(data.url, data.path, {
          width: data.width,
          height: data.height,
          filename: data.filename
        });
      } else {
        alert(`Upload error: ${data.error}`);
      }
    } catch (e: any) {
      alert(`Upload error: ${e.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-cyan-100 flex items-center gap-2">
            <Waves className="h-4 w-4 text-cyan-400" />
            1. Target Overlay Image (Ảnh Gốc Cần Tạo Khung)
          </h2>
          <p className="text-xs text-cyan-300/60 font-medium">
            Tải lên hình ảnh thiết kế bạn đã tạo bằng AI (Midjourney, DALL-E, Photoshop, v.v.)
          </p>
        </div>
        {selectedImage && (
          <button
            onClick={onClear}
            disabled={isProcessing}
            className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-white transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Xóa / Thay ảnh
          </button>
        )}
      </div>

      {!selectedImage ? (
        <div>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-cyan-400 bg-[#0a2e5c]/70 shadow-[0_0_30px_rgba(0,180,216,0.3)]'
                : 'border-cyan-500/30 hover:border-cyan-400 bg-[#061e3d]/60 hover:bg-[#092952]/70 shadow-[0_8px_30px_rgba(0,15,35,0.4)]'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
              }}
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
            />

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_20px_rgba(0,180,216,0.4)] text-white group-hover:scale-110 transition-transform">
              <UploadCloud className="h-7 w-7 text-white" />
            </div>

            <p className="mt-4 text-sm font-bold text-cyan-100 group-hover:text-white">
              {isUploading ? 'Đang tải ảnh lên máy chủ...' : 'Kéo & thả ảnh vào đây, hoặc click để duyệt file'}
            </p>
            <p className="mt-1 text-xs text-cyan-300/50">
              Hỗ trợ PNG, JPG, JPEG, WEBP (Tối đa 25MB)
            </p>
          </div>

          {/* Quick preset templates */}
          <div className="mt-3.5">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              Hoặc thử ngay với mẫu có sẵn:
            </span>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {samplePresets.map((sample) => (
                <button
                  key={sample.name}
                  onClick={() =>
                    onImageSelected(sample.url, undefined, {
                      width: sample.width,
                      height: sample.height,
                      filename: sample.name
                    })
                  }
                  className="flex flex-col items-start rounded-xl border border-cyan-500/25 bg-[#07244a]/70 p-2.5 text-left text-xs transition-all hover:border-cyan-400 hover:bg-[#0b3366] hover:shadow-[0_0_15px_rgba(0,180,216,0.25)]"
                >
                  <span className="font-bold text-cyan-100 truncate w-full">{sample.name}</span>
                  <span className="text-[10px] text-cyan-300/60 font-mono">{sample.width}×{sample.height}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-2xl border border-cyan-500/30 bg-[#072244]/80 backdrop-blur-md p-3.5 shadow-[0_8px_30px_rgba(0,15,35,0.5)]">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#031326] flex items-center justify-center border border-cyan-500/20 shadow-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage}
              alt="Source target overlay"
              className="max-h-full max-w-full object-contain"
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-cyan-200">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white truncate max-w-[200px]">
                {imageMeta?.filename || 'target_image.png'}
              </span>
              {imageMeta && (
                <span className="rounded-md bg-cyan-950/80 border border-cyan-500/30 px-2 py-0.5 text-[11px] text-cyan-300 font-mono">
                  {imageMeta.width} × {imageMeta.height} px
                </span>
              )}
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="text-xs font-semibold text-cyan-400 hover:text-white underline underline-offset-4"
            >
              Chọn ảnh khác
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
              }}
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
            />
          </div>
        </div>
      )}
    </div>
  );
};
