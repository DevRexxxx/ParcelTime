'use client';

import React from 'react';
import { X, FileText, ZoomIn, ZoomOut, ShieldCheck } from 'lucide-react';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    name: string;
    type: string;
    size: string;
    url?: string;
  } | null;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  file,
}) => {
  const [zoom, setZoom] = React.useState(100);

  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0D0101]/95 border border-white/10 shadow-glass-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-white truncate max-w-xs">{file.name}</div>
              <div className="text-[11px] text-white/50">{file.type} • {file.size} • Verified</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom((z) => Math.min(z + 20, 160))}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white transition-all"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z - 20, 80))}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white transition-all"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-white/60 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Document Content View */}
        <div className="flex-1 overflow-auto p-6 flex flex-col items-center justify-center bg-black/40 min-h-[300px]">
          <div
            className="w-full max-w-md p-6 rounded-2xl bg-white/[0.03] border border-white/10 shadow-2xl flex flex-col items-center text-center transition-transform"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            <div className="w-16 h-16 rounded-3xl bg-primary/20 text-primary border border-primary/40 flex items-center justify-center mb-4 shadow-glow-orange">
              <FileText className="w-8 h-8" />
            </div>

            <div className="text-base font-bold text-white mb-1">{file.name}</div>
            <div className="text-xs text-white/50 mb-4">
              Cryptographically signed custody record • AES-256
            </div>

            {/* Document Details Card */}
            <div className="w-full text-left p-3 rounded-xl bg-black/60 border border-white/[0.08] space-y-2 text-xs font-mono text-white/70 mb-4">
              <div className="flex justify-between">
                <span className="text-white/40">SOCIETY:</span>
                <span className="text-white">Greenwood Palms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">VERIFIED BY:</span>
                <span className="text-emerald-400">Reception Officer</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">CHECKSUM:</span>
                <span className="text-primary truncate max-w-[140px]">sha256:8f4c...3e1a</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Valid & Untampered Audit Certificate</span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
          <div className="text-xs text-white/40">Protected by Indian DPDP Act 2023 Guidelines</div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-white transition-all"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};

