'use client';

import React from 'react';
import { FileText, Eye, Download, Image as ImageIcon } from 'lucide-react';

interface FilesCardProps {
  onOpenFilePreview?: (file: { name: string; type: string; size: string; url: string }) => void;
}

export const FilesCard: React.FC<FilesCardProps> = ({ onOpenFilePreview }) => {
  const files = [
    {
      name: 'Amazon_Shipping_Label_402.pdf',
      type: 'PDF Document',
      size: '142 KB',
      url: '/docs/shipping-label.pdf',
    },
    {
      name: 'Gate1_Intake_Proof_Photo.jpg',
      type: 'Proof Photo',
      size: '320 KB',
      url: '/docs/parcel-photo.jpg',
    },
    {
      name: 'Society_Custody_Policy_v1.pdf',
      type: 'Policy Document',
      size: '512 KB',
      url: '/docs/custody-policy.pdf',
    },
  ];

  return (
    <div className="p-5 rounded-3xl glass-panel border border-white/[0.08] hover:border-white/[0.18] transition-all duration-300 relative group overflow-hidden">
      <div className="flex items-center justify-between text-xs text-white/50 mb-3">
        <span className="font-semibold tracking-wider text-[10px] uppercase text-emerald-400 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          Files & Receipts
        </span>
        <span className="text-[10px] text-white/40 font-mono">Encrypted</span>
      </div>

      <div className="space-y-2 mb-3">
        {files.map((file, idx) => (
          <div
            key={idx}
            onClick={() => onOpenFilePreview?.(file)}
            className="p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.05] cursor-pointer flex items-center justify-between group/f transition-all"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              {file.name.endsWith('.pdf') ? (
                <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <ImageIcon className="w-4 h-4 text-primary shrink-0" />
              )}
              <div className="truncate">
                <div className="text-xs text-white/80 group-hover/f:text-white truncate font-medium">
                  {file.name}
                </div>
                <div className="text-[10px] text-white/40">{file.type} • {file.size}</div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all"
                title="Preview"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-white/40">
        <span>Stored in S3 Private Vault</span>
        <span className="text-emerald-400 text-[10px] font-mono">AES-256</span>
      </div>
    </div>
  );
};

