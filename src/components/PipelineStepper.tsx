'use client';

import React from 'react';
import { Check, Loader2, Sparkles, Scissors, Layers, Sun, ShieldCheck, Waves } from 'lucide-react';

export type PipelineStep = 1 | 2 | 3 | 4 | 5 | 'done' | 'idle' | 'error';

interface PipelineStepperProps {
  currentStep: PipelineStep;
  statusMessage?: string;
}

export const PipelineStepper: React.FC<PipelineStepperProps> = ({ currentStep, statusMessage }) => {
  const steps = [
    {
      step: 1,
      title: '1. Phân Tích Hình Ảnh',
      desc: 'Nhận diện phong cách, bố cục, bảng màu và tỷ lệ khung',
      icon: Sparkles
    },
    {
      step: 2,
      title: '2. Tách & Xử Lý Nền',
      desc: 'Tách khung khỏi nền gốc, giữ nguyên viền mảnh & ánh sáng',
      icon: Scissors
    },
    {
      step: 3,
      title: '3. Tái Tạo Khung Overlay',
      desc: 'Giữ nguyên ngôn ngữ hình ảnh & cấu trúc thẩm mỹ tham chiếu',
      icon: Layers
    },
    {
      step: 4,
      title: '4. Bổ Sung Hiệu Ứng',
      desc: 'Outer glow, drop shadow, neon falloff & metallic sheen',
      icon: Sun
    },
    {
      step: 5,
      title: '5. Kiểm Tra Chất Lượng',
      desc: 'Kiểm tra răng cưa, kiểm tra alpha trong suốt & xuất RGBA',
      icon: ShieldCheck
    }
  ];

  if (currentStep === 'idle') return null;

  const isStepCompleted = (stepNum: number) => {
    if (currentStep === 'done') return true;
    if (typeof currentStep === 'number') {
      return currentStep > stepNum;
    }
    return false;
  };

  const isStepActive = (stepNum: number) => {
    return currentStep === stepNum;
  };

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-[#072244]/80 backdrop-blur-md p-4 shadow-[0_8px_30px_rgba(0,15,35,0.5)]">
      <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
        <div className="flex items-center gap-2.5">
          {currentStep === 'done' ? (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400 text-black shadow-[0_0_12px_rgba(0,180,216,0.6)]">
              <Check className="h-4 w-4 font-bold" />
            </div>
          ) : (
            <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
          )}
          <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-100 flex items-center gap-1.5">
            <Waves className="h-4 w-4 text-cyan-400" />
            {currentStep === 'done' ? 'Tạo Khung Overlay Hoàn Tất' : 'Quy Trình Xử Lý AI Tự Động'}
          </span>
        </div>
        <span className="text-xs font-mono font-bold text-cyan-400">
          {typeof currentStep === 'number' ? `Bước ${currentStep}/5` : currentStep === 'done' ? '100% Sẵn Sàng' : ''}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-5">
        {steps.map((s) => {
          const completed = isStepCompleted(s.step);
          const active = isStepActive(s.step);
          const Icon = s.icon;

          return (
            <div
              key={s.step}
              className={`relative flex flex-col justify-between rounded-xl border p-3 transition-all ${
                active
                  ? 'border-cyan-400 bg-gradient-to-b from-[#0077b6] to-[#023e8a] text-white shadow-[0_0_18px_rgba(0,180,216,0.4)]'
                  : completed
                  ? 'border-cyan-500/30 bg-[#051d3b]/80 text-cyan-200'
                  : 'border-cyan-900/30 bg-[#031326]/50 text-cyan-500/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`h-4 w-4 ${active ? 'text-white animate-pulse' : completed ? 'text-cyan-300' : 'text-cyan-600/40'}`} />
                {completed ? (
                  <Check className="h-3.5 w-3.5 text-cyan-300 font-bold" />
                ) : active ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                ) : null}
              </div>

              <div className="mt-2.5">
                <h4 className={`text-xs font-bold leading-tight ${active ? 'text-white' : completed ? 'text-cyan-100' : 'text-cyan-400/50'}`}>
                  {s.title}
                </h4>
                <p className={`mt-0.5 text-[10px] leading-tight line-clamp-2 ${active ? 'text-cyan-100' : completed ? 'text-cyan-300/60' : 'text-cyan-500/30'}`}>
                  {s.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {statusMessage && (
        <p className="mt-3 text-center text-xs text-cyan-300 font-semibold animate-pulse">
          {statusMessage}
        </p>
      )}
    </div>
  );
};
