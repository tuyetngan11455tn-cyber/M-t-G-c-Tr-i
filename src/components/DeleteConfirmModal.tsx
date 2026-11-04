import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  characterName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  characterName,
  onConfirm,
  onCancel,
  isDeleting = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#0e111a] border border-red-500/40 rounded-2xl p-6 shadow-2xl relative"
        style={{ boxShadow: '0 0 35px rgba(239, 68, 68, 0.25)' }}
      >
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 text-red-400 mb-4">
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Xác nhận xóa nhân vật</h3>
            <span className="text-xs text-red-400/80 font-mono-code">Thao tác của Chủ Kho</span>
          </div>
        </div>

        <div className="py-2 mb-6">
          <p className="text-zinc-200 text-base leading-relaxed">
            Bạn có chắc muốn xóa nhân vật <span className="font-semibold text-white underline decoration-red-500/60 decoration-2">{characterName}</span> này?
          </p>
          <p className="text-xs text-zinc-400 mt-2">
            Nhân vật sẽ bị xóa hoàn toàn khỏi cơ sở dữ liệu dùng chung và người dùng sẽ không còn nhìn thấy nữa.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors border border-zinc-700/60"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition-all shadow-lg shadow-red-600/30 flex items-center gap-2"
          >
            {isDeleting ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};
