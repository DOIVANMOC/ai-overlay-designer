'use client';

import React from 'react';
import { Sliders, Sun, Shield, Sparkles, Layers, Scissors, Monitor, Waves } from 'lucide-react';
import { OverlayProcessingOptions } from '@/lib/types';

interface EffectControlsProps {
  options: OverlayProcessingOptions;
  onChange: (updated: Partial<OverlayProcessingOptions>) => void;
  detectedPalette?: string[];
  disabled?: boolean;
}

export const EffectControls: React.FC<EffectControlsProps> = ({
  options,
  onChange,
  detectedPalette = [],
  disabled
}) => {
  const quickColors = [
    '#00e5ff', // Cyber cyan
    '#ffd700', // Mecha gold
    '#00b4d8', // Ocean aqua
    '#ff007f', // Neon magenta
    '#00ff66', // Matrix green
    '#ffffff', // Pure white
    '#a855f7'  // Deep purple
  ];

  return (
    <div className="space-y-4 rounded-2xl border border-cyan-500/30 bg-[#072244]/80 backdrop-blur-md p-4 shadow-[0_8px_30px_rgba(0,15,35,0.5)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-cyan-100">
            3. Effect & Output Tuning (Hiệu Ứng & Độ Phân Giải)
          </h3>
        </div>
        <span className="text-[11px] text-cyan-300/60 font-semibold">Fine-tune controls</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Outer Glow */}
        <div className="space-y-1.5 rounded-xl bg-[#051c3b]/60 p-2.5 border border-cyan-500/20">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-cyan-200 flex items-center gap-1.5">
              <Sun className="h-3.5 w-3.5 text-cyan-400" />
              Outer Glow (Ánh Sáng Viền)
            </span>
            <span className="font-mono text-cyan-300 font-bold">{options.glowIntensity}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={options.glowIntensity}
            disabled={disabled}
            onChange={(e) => onChange({ glowIntensity: Number(e.target.value) })}
            className="w-full accent-cyan-400 h-1.5 bg-[#031326] rounded-lg cursor-pointer"
          />

          {/* Glow color picker */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="color"
              value={options.glowColor}
              disabled={disabled}
              onChange={(e) => onChange({ glowColor: e.target.value })}
              className="h-6 w-6 cursor-pointer rounded border border-cyan-500/40 p-0 bg-transparent"
            />
            <div className="flex items-center gap-1.5">
              {quickColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => onChange({ glowColor: color })}
                  className={`h-4 w-4 rounded-full border border-black/40 transition-transform ${
                    options.glowColor.toLowerCase() === color.toLowerCase()
                      ? 'scale-125 ring-2 ring-cyan-400 shadow-[0_0_8px_rgba(0,180,216,0.6)]'
                      : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Drop Shadow */}
        <div className="space-y-1.5 rounded-xl bg-[#051c3b]/60 p-2.5 border border-cyan-500/20">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-cyan-200 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-cyan-400" />
              Drop Shadow (Độ Sâu Đổ Bóng)
            </span>
            <span className="font-mono text-cyan-300 font-bold">{options.shadowIntensity}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={options.shadowIntensity}
            disabled={disabled}
            onChange={(e) => onChange({ shadowIntensity: Number(e.target.value) })}
            className="w-full accent-cyan-400 h-1.5 bg-[#031326] rounded-lg cursor-pointer"
          />
          <p className="text-[10px] text-cyan-300/50">Tạo bóng 3D chân thực tách biệt khung khỏi nền stream</p>
        </div>

        {/* Metallic Bevel Boost */}
        <div className="space-y-1.5 rounded-xl bg-[#051c3b]/60 p-2.5 border border-cyan-500/20">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-cyan-200 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              Metallic Bevel (Độ Bóng Kim Loại)
            </span>
            <span className="font-mono text-cyan-300 font-bold">{options.metallicBoost}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={60}
            value={options.metallicBoost}
            disabled={disabled}
            onChange={(e) => onChange({ metallicBoost: Number(e.target.value) })}
            className="w-full accent-cyan-400 h-1.5 bg-[#031326] rounded-lg cursor-pointer"
          />
          <p className="text-[10px] text-cyan-300/50">Tăng độ sắc nét bề mặt giáp mecha và viền chrome</p>
        </div>

        {/* Neon Boost */}
        <div className="space-y-1.5 rounded-xl bg-[#051c3b]/60 p-2.5 border border-cyan-500/20">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-cyan-200 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-cyan-400" />
              Neon Vibrancy (Độ Rực Rỡ)
            </span>
            <span className="font-mono text-cyan-300 font-bold">{options.neonBoost}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={60}
            value={options.neonBoost}
            disabled={disabled}
            onChange={(e) => onChange({ neonBoost: Number(e.target.value) })}
            className="w-full accent-cyan-400 h-1.5 bg-[#031326] rounded-lg cursor-pointer"
          />
          <p className="text-[10px] text-cyan-300/50">Tăng cường độ bão hòa dải laser và neon stream</p>
        </div>
      </div>

      {/* Background Mode & Resolution row */}
      <div className="grid grid-cols-1 gap-4 pt-2 border-t border-cyan-500/20 sm:grid-cols-2">
        {/* Output Background */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-cyan-100 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Waves className="h-3.5 w-3.5 text-cyan-400" />
              Màu Nền Khung (Background):
            </span>
            <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
              {options.backgroundColor === 'ocean'
                ? '🌊 Xanh Đại Dương'
                : options.backgroundColor === 'black'
                ? 'Đen'
                : 'Trong Suốt'}
            </span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => onChange({ backgroundColor: 'ocean' })}
              disabled={disabled}
              className={`rounded-xl border py-2 px-2 text-center text-xs font-bold transition-all ${
                options.backgroundColor === 'ocean'
                  ? 'border-cyan-400 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(0,180,216,0.5)]'
                  : 'border-cyan-500/25 bg-[#061d3c]/70 text-cyan-200 hover:border-cyan-400 hover:bg-[#092b52]'
              }`}
            >
              🌊 Đại Dương
            </button>
            <button
              type="button"
              onClick={() => onChange({ backgroundColor: 'transparent' })}
              disabled={disabled}
              className={`rounded-xl border py-2 px-2 text-center text-xs font-bold transition-all ${
                options.backgroundColor !== 'ocean' && options.backgroundColor !== 'black'
                  ? 'border-cyan-400 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(0,180,216,0.5)]'
                  : 'border-cyan-500/25 bg-[#061d3c]/70 text-cyan-200 hover:border-cyan-400 hover:bg-[#092b52]'
              }`}
            >
              Trong Suốt (Alpha)
            </button>
            <button
              type="button"
              onClick={() => onChange({ backgroundColor: 'black' })}
              disabled={disabled}
              className={`rounded-xl border py-2 px-2 text-center text-xs font-bold transition-all ${
                options.backgroundColor === 'black'
                  ? 'border-cyan-400 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(0,180,216,0.5)]'
                  : 'border-cyan-500/25 bg-[#061d3c]/70 text-cyan-200 hover:border-cyan-400 hover:bg-[#092b52]'
              }`}
            >
              Đen Tuyền
            </button>
          </div>
        </div>

        {/* Output Resolution */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-cyan-100 flex items-center gap-1.5">
            <Monitor className="h-3.5 w-3.5 text-cyan-400" />
            Độ phân giải xuất (Resolution):
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {(['original', '1080p', '1440p', '4k'] as const).map((res) => (
              <button
                key={res}
                type="button"
                onClick={() => onChange({ resolution: res })}
                disabled={disabled}
                className={`rounded-xl border py-2 text-center text-xs font-bold transition-all ${
                  options.resolution === res
                    ? 'border-cyan-400 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(0,180,216,0.5)]'
                    : 'border-cyan-500/25 bg-[#061d3c]/70 text-cyan-200 hover:border-cyan-400 hover:bg-[#092b52]'
                }`}
              >
                {res === 'original' ? 'Gốc' : res.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Center Hollow Cutout Row */}
      <div className="pt-2 border-t border-cyan-500/20">
        <label className="text-xs font-bold text-cyan-100 flex items-center gap-1.5">
          <Scissors className="h-3.5 w-3.5 text-cyan-400" />
          Khoét rỗng vùng giữa (Hollow Viewport):
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer pt-1.5">
          <input
            type="checkbox"
            checked={options.hollowCenter}
            disabled={disabled}
            onChange={(e) => onChange({ hollowCenter: e.target.checked })}
            className="h-4 w-4 rounded border-cyan-500/40 accent-cyan-400 cursor-pointer"
          />
          <span className="text-xs text-cyan-200 font-medium">
            Đảm bảo 100% trong suốt tâm khung cho webcam/gameplay OBS
          </span>
        </label>
      </div>
    </div>
  );
};
