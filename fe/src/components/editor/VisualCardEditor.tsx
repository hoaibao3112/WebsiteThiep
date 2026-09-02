"use client";

import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Undo2,
  Redo2,
  X,
  Type,
  Image as ImageIcon,
  Music,
  Palette,
  Sparkles,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react";
import { applyDraftPatch, readDraftPath } from "@/lib/editor/patch-draft";
import { EditorField, getTemplateFields } from "@/lib/editor/template-registry";
import { uploadSingleImage } from "@/lib/image-upload";

interface VisualCardEditorProps<T extends object> {
  templateSlug: string;
  draft: T;
  children: ReactNode;
  onDraftChange: (draft: T) => void;
  onSave?: () => void | Promise<void>;
  isVip?: boolean;
}

export function VisualCardEditor<T extends object>({
  templateSlug,
  draft,
  children,
  onDraftChange,
  onSave,
  isVip = false,
}: VisualCardEditorProps<T>) {
  const fields = useMemo(() => getTemplateFields(templateSlug), [templateSlug]);
  const [selected, setSelected] = useState<EditorField | null>(null);
  const [past, setPast] = useState<T[]>([]);
  const [future, setFuture] = useState<T[]>([]);
  const [dirtyTick, setDirtyTick] = useState(0);
  const [saveState, setSaveState] = useState<"saved" | "dirty" | "saving">("saved");

  const saveRef = useRef(onSave);
  useEffect(() => {
    saveRef.current = onSave;
  }, [onSave]);

  const value = selected ? readDraftPath(draft, selected.path) : undefined;

  const change = (nextValue: unknown) => {
    if (!selected) return;
    const next = applyDraftPatch(draft, selected.path, nextValue);
    setPast((items) => [...items.slice(-19), draft]);
    setFuture([]);
    onDraftChange(next);
    setDirtyTick((tick) => tick + 1);
    setSaveState("dirty");
  };

  useEffect(() => {
    if (!dirtyTick || !onSave) return;
    setSaveState("saving");
    const timer = window.setTimeout(() => {
      void Promise.resolve(saveRef.current?.())
        .then(() => setSaveState("saved"))
        .catch(() => setSaveState("dirty"));
    }, 600);
    return () => window.clearTimeout(timer);
  }, [dirtyTick]);

  const undo = () => {
    const previous = past[past.length - 1];
    if (!previous) return;
    setPast((items) => items.slice(0, -1));
    setFuture((items) => [draft, ...items]);
    onDraftChange(previous);
  };

  const redo = () => {
    const next = future[0];
    if (!next) return;
    setFuture((items) => items.slice(1));
    setPast((items) => [...items, draft]);
    onDraftChange(next);
  };

  const visibleFields = fields.filter(
    (field) => isVip || field.type !== "effect" || !field.allowedValues?.includes("GIFT_BOX")
  );

  // Group fields by category for mobile bottom bar
  const textFields = visibleFields.filter((f) => f.type === "text");
  const imageFields = visibleFields.filter((f) => f.type === "image");
  const musicField = visibleFields.find((f) => f.type === "music");
  const styleFields = visibleFields.filter((f) => f.type === "color" || f.type === "font");
  const effectFields = visibleFields.filter((f) => f.type === "effect");

  const [activeCategory, setActiveCategory] = useState<"text" | "image" | "music" | "style" | "effect" | null>(null);

  const handleOpenCategory = (cat: "text" | "image" | "music" | "style" | "effect") => {
    setActiveCategory(cat);
    if (cat === "text" && textFields.length > 0) setSelected(textFields[0]);
    else if (cat === "image" && imageFields.length > 0) setSelected(imageFields[0]);
    else if (cat === "music" && musicField) setSelected(musicField);
    else if (cat === "style" && styleFields.length > 0) setSelected(styleFields[0]);
    else if (cat === "effect" && effectFields.length > 0) setSelected(effectFields[0]);
  };

  return (
    <div className="relative w-full">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. DESKTOP VIEW (3-Column Studio Layout)                      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="hidden lg:grid min-h-[680px] gap-4 lg:grid-cols-[200px_minmax(320px,1fr)_300px]">
        {/* LEFT COLUMN: FIELD GROUPS */}
        <aside className="rounded-2xl border border-stone-200 bg-white p-3.5 shadow-xs flex flex-col justify-between">
          <div>
            <p className="mb-3 px-2 text-xs font-bold uppercase tracking-wider text-stone-500">
              Chỉnh Trực Tiếp
            </p>
            <div className="space-y-1">
              {visibleFields.map((field) => (
                <button
                  key={field.id}
                  type="button"
                  onClick={() => setSelected(field)}
                  className={`block w-full min-h-10 rounded-xl px-3 text-left text-xs font-medium transition cursor-pointer ${
                    selected?.id === field.id
                      ? "bg-amber-100/70 font-bold text-amber-950 border border-amber-300/80 shadow-2xs"
                      : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                  }`}
                >
                  {field.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
            <span className="text-[11px] text-stone-400">Lịch sử sửa</span>
            <div className="flex gap-1">
              <button
                type="button"
                aria-label="Hoàn tác"
                onClick={undo}
                disabled={!past.length}
                className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
                title="Hoàn tác (Undo)"
              >
                <Undo2 className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Làm lại"
                onClick={redo}
                disabled={!future.length}
                className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
                title="Làm lại (Redo)"
              >
                <Redo2 className="size-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* CENTER COLUMN: LIVE INTERACTIVE PREVIEW */}
        <section className="min-w-0 rounded-2xl border border-stone-200 bg-stone-100/90 p-4 shadow-inner flex flex-col items-center">
          <div className="w-full max-w-[390px] mb-2 flex items-center justify-between text-xs text-stone-500">
            <span className="font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Mobile Preview
            </span>
            <span aria-live="polite" className="inline-flex items-center gap-1 text-emerald-700 font-medium">
              <Check className="size-3" />
              {saveState === "saving" ? "Đang lưu..." : saveState === "dirty" ? "Chưa lưu" : "Đã lưu"}
            </span>
          </div>

          <div className="relative mx-auto h-[640px] w-full max-w-[390px] overflow-hidden rounded-[36px] bg-white shadow-2xl border-4 border-stone-800">
            <div className="h-full overflow-y-auto overflow-x-hidden">{children}</div>
          </div>
        </section>

        {/* RIGHT COLUMN: INSPECTOR PANEL */}
        <aside className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs flex flex-col justify-between">
          {selected ? (
            <div>
              <div className="mb-4 flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Đang tùy chỉnh</span>
                  <h2 className="text-sm font-bold text-stone-900">{selected.label}</h2>
                </div>
                <button
                  type="button"
                  aria-label="Đóng chỉnh sửa"
                  onClick={() => setSelected(null)}
                  className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <Inspector field={selected} value={value} onChange={change} isVip={isVip} />
            </div>
          ) : (
            <div className="flex h-full min-h-48 flex-col items-center justify-center text-center p-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700 mb-3">
                <SlidersHorizontal className="size-5" />
              </div>
              <h3 className="text-xs font-bold text-stone-800 mb-1">Chạm để chỉnh sửa</h3>
              <p className="text-[11px] text-stone-400 leading-relaxed">
                Chọn một mục bên trái hoặc bên dưới để tùy chỉnh thông tin, ảnh cưới, nhạc nền.
              </p>
            </div>
          )}

          {onSave && (
            <button
              type="button"
              onClick={onSave}
              className="mt-6 min-h-11 w-full rounded-xl bg-gradient-to-r from-[#BE944E] to-[#D4AF37] text-xs font-bold uppercase tracking-wider text-white shadow-md hover:opacity-95 transition cursor-pointer"
            >
              Lưu bản nháp
            </button>
          )}
        </aside>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. MOBILE-FIRST VIEW (Canva / Instagram Stories Style)         */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="lg:hidden relative min-h-screen pb-32">
        {/* MOBILE TOP QUICK BAR */}
        <div className="sticky top-14 z-30 mb-2 flex items-center justify-between rounded-xl bg-white/95 px-3 py-2 shadow-xs border border-stone-200/80 backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Chạm công cụ bên dưới để sửa</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={undo}
              disabled={!past.length}
              className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 disabled:opacity-20 cursor-pointer"
              title="Hoàn tác"
            >
              <Undo2 className="size-4" />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={!future.length}
              className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 disabled:opacity-20 cursor-pointer"
              title="Làm lại"
            >
              <Redo2 className="size-4" />
            </button>
          </div>
        </div>

        {/* FULL MOBILE CARD PREVIEW */}
        <div className="w-full rounded-2xl overflow-hidden shadow-lg border border-stone-200 bg-white">
          {children}
        </div>

        {/* FLOATING MOBILE BOTTOM TOOL DOCK */}
        <div className="fixed bottom-3 left-3 right-3 z-40">
          <div className="flex items-center justify-around rounded-2xl bg-stone-900/95 p-2 text-white shadow-2xl border border-stone-800/80 backdrop-blur-lg">
            <button
              type="button"
              onClick={() => handleOpenCategory("text")}
              className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-semibold transition cursor-pointer ${
                activeCategory === "text" ? "bg-amber-500 text-stone-950 font-bold" : "text-stone-300 hover:text-white"
              }`}
            >
              <Type className="size-4" />
              <span>Chữ & Tên</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenCategory("image")}
              className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-semibold transition cursor-pointer ${
                activeCategory === "image" ? "bg-amber-500 text-stone-950 font-bold" : "text-stone-300 hover:text-white"
              }`}
            >
              <ImageIcon className="size-4" />
              <span>Hình ảnh</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenCategory("music")}
              className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-semibold transition cursor-pointer ${
                activeCategory === "music" ? "bg-amber-500 text-stone-950 font-bold" : "text-stone-300 hover:text-white"
              }`}
            >
              <Music className="size-4" />
              <span>Nhạc nền</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenCategory("style")}
              className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-semibold transition cursor-pointer ${
                activeCategory === "style" ? "bg-amber-500 text-stone-950 font-bold" : "text-stone-300 hover:text-white"
              }`}
            >
              <Palette className="size-4" />
              <span>Màu & Font</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenCategory("effect")}
              className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-semibold transition cursor-pointer ${
                activeCategory === "effect" ? "bg-amber-500 text-stone-950 font-bold" : "text-stone-300 hover:text-white"
              }`}
            >
              <Sparkles className="size-4" />
              <span>Hiệu ứng</span>
            </button>
          </div>
        </div>

        {/* MOBILE BOTTOM SHEET (DRAWER KÉO LÊN) */}
        <AnimatePresence>
          {activeCategory && selected && (
            <>
              {/* BACKDROP OVERLAY */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setActiveCategory(null);
                  setSelected(null);
                }}
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs"
              />

              {/* BOTTOM SHEET CONTAINER */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl border-t border-stone-200"
              >
                {/* DRAG HANDLE */}
                <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-stone-300" />

                {/* SHEET HEADER */}
                <div className="mb-4 flex items-center justify-between pb-2 border-b border-stone-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                      Chỉnh sửa trực quan
                    </span>
                    <h2 className="text-base font-bold text-stone-900">{selected.label}</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory(null);
                      setSelected(null);
                    }}
                    className="p-1.5 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 cursor-pointer"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {/* SUB-CATEGORY CHIPS IF MULTIPLE FIELDS IN ACTIVE CATEGORY */}
                {activeCategory === "text" && textFields.length > 1 && (
                  <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
                    {textFields.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setSelected(f)}
                        className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                          selected.id === f.id
                            ? "bg-amber-500 text-white border-amber-500 font-bold"
                            : "bg-stone-100 text-stone-600 border-stone-200"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                )}

                {activeCategory === "image" && imageFields.length > 1 && (
                  <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
                    {imageFields.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setSelected(f)}
                        className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                          selected.id === f.id
                            ? "bg-amber-500 text-white border-amber-500 font-bold"
                            : "bg-stone-100 text-stone-600 border-stone-200"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* INSPECTOR CONTROLS */}
                <div className="pb-6">
                  <Inspector field={selected} value={value} onChange={change} isVip={isVip} />

                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory(null);
                      setSelected(null);
                    }}
                    className="mt-5 w-full py-3 rounded-xl bg-stone-900 text-white text-xs font-bold uppercase tracking-wider shadow-md hover:bg-stone-800 cursor-pointer"
                  >
                    Hoàn Tất
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Inspector({
  field,
  value,
  onChange,
  isVip,
}: {
  field: EditorField;
  value: unknown;
  onChange: (value: unknown) => void;
  isVip: boolean;
}) {
  if (field.type === "color")
    return (
      <div className="space-y-3">
        <label className="text-xs text-stone-500 font-medium">Bảng màu chủ đạo:</label>
        <div className="flex items-center gap-3">
          <input
            aria-label={field.label}
            type="color"
            value={typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value : "#BE944E"}
            onChange={(e) => onChange(e.target.value)}
            className="h-12 w-16 cursor-pointer rounded-xl border border-stone-300 p-1"
          />
          <span className="font-mono text-xs font-bold text-stone-700 bg-stone-100 px-3 py-2 rounded-lg border border-stone-200">
            {typeof value === "string" ? value : "#BE944E"}
          </span>
        </div>
        <div className="flex gap-2 pt-2">
          {["#BE944E", "#B76E79", "#F97316", "#4169A1", "#D989A6", "#10B981"].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              className="w-8 h-8 rounded-full border-2 border-white shadow-md cursor-pointer transition hover:scale-110"
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
      </div>
    );

  if (field.type === "font" || field.type === "effect")
    return (
      <div className="space-y-2">
        <label className="text-xs text-stone-500 font-medium">Lựa chọn kiểu:</label>
        <select
          aria-label={field.label}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm font-medium focus:border-amber-500 focus:outline-none"
        >
          <option value="">Mặc định của mẫu</option>
          {field.allowedValues
            ?.filter((option) => isVip || !["GATE_OPEN", "GIFT_BOX", "BALLOON"].includes(option))
            .map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
        </select>
      </div>
    );

  if (field.type === "image")
    return <ImageInspector value={typeof value === "string" ? value : ""} onChange={onChange} />;

  if (field.type === "music")
    return <MusicInspector value={typeof value === "string" ? value : ""} onChange={onChange} />;

  return (
    <div className="space-y-2">
      <label className="text-xs text-stone-500 font-medium">Nội dung văn bản:</label>
      <textarea
        aria-label={field.label}
        value={typeof value === "string" ? value : ""}
        maxLength={field.maxLength}
        onChange={(e) => onChange(e.target.value)}
        rows={field.type === "text" && field.maxLength && field.maxLength > 150 ? 4 : 2}
        className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-amber-500 focus:outline-none leading-relaxed"
        placeholder={`Nhập ${field.label.toLowerCase()}...`}
      />
    </div>
  );
}

function ImageInspector({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  async function choose(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Vui lòng chọn file ảnh (JPG, PNG, WebP)");
    if (file.size > 10 * 1024 * 1024) return setError("Ảnh tối đa 10MB");
    setUploading(true);
    setError("");
    try {
      const url = await uploadSingleImage(file);
      if (url.startsWith("data:")) throw new Error("Không thể tải ảnh lên máy chủ. Vui lòng thử lại.");
      onChange(url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Tải ảnh thất bại");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="aspect-video overflow-hidden rounded-xl bg-stone-100 border border-stone-200 shadow-inner">
        {value ? (
          <img src={value} alt="Ảnh đang chọn" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-xs text-stone-400">Chưa có ảnh</div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          void choose(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="min-h-11 flex-1 rounded-xl bg-stone-900 px-4 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-stone-800 disabled:opacity-50 cursor-pointer"
        >
          {uploading ? "Đang tải lên..." : "Chọn ảnh từ điện thoại"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="min-h-11 rounded-xl border border-rose-200 px-4 text-xs font-bold text-rose-700 hover:bg-rose-50 cursor-pointer"
          >
            Xóa ảnh
          </button>
        )}
      </div>
      {error && <p role="alert" className="text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
}

const MUSIC_LIBRARY = [
  { name: "Lễ Đường (Nhạc Cưới)", src: "/music/le-duong.mp3" },
  { name: "Everytime We Touch", src: "/music/everytime-we-touch.mp3" },
  { name: "Like My Father", src: "/music/like-my-father.mp3" },
  { name: "Tắt nhạc nền", src: "" },
];

function MusicInspector({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => () => {
    audioRef.current?.pause();
  }, []);

  const toggle = (src: string) => {
    if (!src) return;
    if (preview === src) {
      audioRef.current?.pause();
      setPreview(null);
    } else {
      audioRef.current?.pause();
      const audio = new Audio(src);
      audioRef.current = audio;
      void audio.play().catch(() => undefined);
      setPreview(src);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs text-stone-500 font-medium">Kho nhạc nền cưới & sự kiện:</label>
      {MUSIC_LIBRARY.map((track) => (
        <div
          key={track.src || "off"}
          className={`flex items-center justify-between rounded-xl border p-3 transition ${
            value === track.src
              ? "border-amber-500 bg-amber-50/80 font-bold text-amber-950 shadow-2xs"
              : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
          }`}
        >
          <button
            type="button"
            onClick={() => onChange(track.src)}
            className="min-h-8 flex-1 text-left text-xs font-medium cursor-pointer"
          >
            {track.name}
          </button>
          {track.src && (
            <button
              type="button"
              aria-label={`Nghe thử ${track.name}`}
              onClick={() => toggle(track.src)}
              className="rounded-lg bg-stone-100 px-3 py-1.5 text-[11px] font-semibold text-stone-600 hover:bg-stone-200 cursor-pointer"
            >
              {preview === track.src ? "Dừng" : "Nghe thử"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

