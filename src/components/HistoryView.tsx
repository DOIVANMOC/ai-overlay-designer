'use client';

import React from 'react';
import { History, Download, Trash2, ArrowUpRight, CheckCircle2, ShieldCheck, Waves } from 'lucide-react';
import { HistoryItem } from '@/lib/types';

interface HistoryViewProps {
  history: HistoryItem[];
  onHistoryUpdated: () => void;
  onLoadHistoryItem: (item: HistoryItem) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onHistoryUpdated,
  onLoadHistoryItem
}) => {
  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có muốn xóa thiết kế này khỏi lịch sử?')) return;
    try {
      const res = await fetch(`/api/history?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onHistoryUpdated();
      }
    } catch (e: any) {
      alert(`Lỗi: ${e.message}`);
    }
  };

  const handleDownload = (url: string, title: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}_transparent.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (history.length === 0) {
    return (
      <div className="mx-auto max-w-4xl text-center py-20">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_24px_rgba(0,180,216,0.4)] text-white mb-3">
          <History className="h-8 w-8 text-white" />
        </div>
        <h3 className="mt-4 text-base font-extrabold text-white">Lịch Sử Thiết Kế Trống</h3>
        <p className="mt-1 text-xs text-cyan-300/60 max-w-sm mx-auto font-medium">
          Các khung Overlay sau khi được AI xử lý sẽ tự động lưu lại ở đây để bạn có thể xem lại và tải bất kỳ lúc nào.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="border-b border-cyan-500/20 pb-4">
        <h2 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
          <History className="h-5 w-5 text-cyan-400" />
          LỊCH SỬ THIẾT KẾ ĐÃ TẠO ({history.length})
        </h2>
        <p className="mt-1 text-xs text-cyan-300/60 font-medium">
          Danh sách các khung overlay nền trong suốt đã được hệ thống tạo và tối ưu hóa trên nền giao diện Đại Dương.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {history.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between rounded-2xl border border-cyan-500/30 bg-[#072244]/80 backdrop-blur-md p-4 shadow-[0_8px_30px_rgba(0,15,35,0.5)] transition-all hover:border-cyan-400 hover:shadow-[0_12px_35px_rgba(0,180,216,0.2)]"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white truncate max-w-[200px]">{item.title}</h3>
                  <span className="text-[11px] font-semibold text-cyan-300/70">{item.theme}</span>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  title="Xóa thiết kế"
                  className="rounded-lg p-1.5 text-cyan-400/60 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Thumbnail with oceanic checkerboard preview */}
              <div className="mt-3 aspect-video w-full overflow-hidden rounded-xl checkerboard-pattern flex items-center justify-center border border-cyan-500/30 p-2 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.outputUrl}
                  alt={item.title}
                  className="max-h-full max-w-full object-contain drop-shadow-[0_0_15px_rgba(0,180,216,0.3)]"
                />
              </div>

              {/* Stats */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-[#04152d] p-2.5 border border-cyan-500/20">
                  <span className="text-[10px] text-cyan-300/60 block font-semibold">Kích thước</span>
                  <span className="font-bold text-cyan-100 font-mono">
                    {item.dimensions.width}×{item.dimensions.height}
                  </span>
                </div>

                <div className="rounded-xl bg-[#04152d] p-2.5 border border-cyan-500/20">
                  <span className="text-[10px] text-cyan-300/60 block font-semibold">Alpha Trong Suốt</span>
                  <span className="font-bold text-cyan-300 font-mono">
                    {item.transparencyPercentage}%
                  </span>
                </div>
              </div>

              {/* Palette */}
              <div className="mt-3 flex items-center gap-1.5">
                {item.palette.slice(0, 5).map((hex, i) => (
                  <span
                    key={i}
                    className="h-4 w-4 rounded-full border border-white/20 inline-block shadow-xs"
                    style={{ backgroundColor: hex }}
                  />
                ))}
                <span className="ml-auto text-[10px] text-cyan-400/60 font-mono">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 pt-3 border-t border-cyan-500/20">
              <button
                type="button"
                onClick={() => onLoadHistoryItem(item)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-cyan-500/30 bg-[#051c3b]/80 py-2.5 text-xs font-bold text-cyan-200 hover:border-cyan-400 hover:text-white transition-all shadow-sm"
              >
                Mở Trong Studio <ArrowUpRight className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleDownload(item.outputUrl, item.title)}
                className="btn-ocean-primary flex items-center justify-center rounded-xl px-4 py-2.5 text-xs font-extrabold text-white shadow-[0_0_15px_rgba(0,180,216,0.3)] transition-all"
                title="Tải PNG ngay"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
