import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Tag,
  Check,
  Palette,
  Sparkles
} from 'lucide-react';
import { TaskCategoryConfig } from '../types/calendar';
import { COLOR_PALETTES } from '../constants/calendar';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: TaskCategoryConfig[];
  onAddCategory: (category: TaskCategoryConfig) => void;
  onDeleteCategory: (categoryId: string) => void;
}

const QUICK_EMOJIS = ['🏃', '🔬', '🎨', '🎵', '🍔', '🚗', '✈️', '🎮', '💻', '💡', '📖', '💪'];

export const CategoryManagerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onDeleteCategory,
}) => {
  const [newLabel, setNewLabel] = useState('');
  const [selectedPaletteIdx, setSelectedPaletteIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) {
      setError('กรุณาพิมพ์ชื่อหมวดหมู่งาน');
      return;
    }

    // Check duplicate
    if (categories.some((c) => c.label.toLowerCase() === newLabel.trim().toLowerCase())) {
      setError('มีหมวดหมู่งานนี้อยู่แล้ว');
      return;
    }

    const palette = COLOR_PALETTES[selectedPaletteIdx];
    const newCatId = `custom-${Date.now()}`;

    const newCategory: TaskCategoryConfig = {
      id: newCatId,
      label: newLabel.trim(),
      badgeBg: palette.bg,
      badgeText: palette.text,
      borderColor: palette.border,
      colorHex: palette.hex,
      isCustom: true,
    };

    onAddCategory(newCategory);
    setNewLabel('');
    setError(null);
  };

  const handleSelectEmoji = (emoji: string) => {
    setNewLabel((prev) => `${prev} ${emoji}`.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 via-blue-600 to-sky-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner">
              <Tag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                จัดการหมวดหมู่งานของอ้วน ๆ 🏷️
              </h3>
              <p className="text-xs text-sky-100">
                เพิ่มและปรับแต่งหมวดหมู่งานได้เองตามใจชอบ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form to Add New Category */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleAdd} className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                เพิ่มหมวดหมู่งานใหม่ของคุณ
              </h4>
            </div>

            {error && (
              <p className="text-xs text-rose-600 font-medium">{error}</p>
            )}

            <div>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="เช่น ออกกำลังกาย, วิจัย, งานพิเศษ..."
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-sky-200 text-xs focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
              />
            </div>

            {/* Quick Emojis */}
            <div>
              <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
                ใส่อิโมจิน่ารัก ๆ:
              </label>
              <div className="flex flex-wrap gap-1">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleSelectEmoji(emoji)}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-sky-50 flex items-center justify-center text-xs transition-colors cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Palette Selector */}
            <div>
              <label className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                <Palette className="w-3 h-3 text-sky-500" />
                เลือกโทนสีการ์ด:
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PALETTES.map((pal, idx) => {
                  const isSelected = selectedPaletteIdx === idx;
                  return (
                    <button
                      key={pal.name}
                      type="button"
                      onClick={() => setSelectedPaletteIdx(idx)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                        pal.bg
                      } ${isSelected ? 'ring-2 ring-slate-800 font-bold shadow-xs' : 'opacity-70 hover:opacity-100'}`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pal.hex }} />
                      <span>{pal.name}</span>
                      {isSelected && <Check className="w-3 h-3 text-slate-700" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-sky-300 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              เพิ่มหมวดหมู่งานนี้
            </button>
          </form>

          {/* Existing Categories List */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              หมวดหมู่งานทั้งหมดในระบบ ({categories.length})
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between ${cat.badgeBg}`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.colorHex }}
                    />
                    <span className="text-xs font-bold truncate">
                      {cat.label}
                    </span>
                  </div>

                  {cat.isCustom ? (
                    <button
                      type="button"
                      onClick={() => onDeleteCategory(cat.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-white/80 transition-colors cursor-pointer"
                      title="ลบหมวดหมู่ที่เพิ่มเอง"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium px-1">
                      ค่าเริ่มต้น
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>
    </div>
  );
};
