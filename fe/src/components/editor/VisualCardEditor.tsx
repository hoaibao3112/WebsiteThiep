"use client";

import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Check, Undo2, Redo2, X } from "lucide-react";
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

export function VisualCardEditor<T extends object>({ templateSlug, draft, children, onDraftChange, onSave, isVip = false }: VisualCardEditorProps<T>) {
  const fields = useMemo(() => getTemplateFields(templateSlug), [templateSlug]);
  const [selected, setSelected] = useState<EditorField | null>(null);
  const [past, setPast] = useState<T[]>([]); const [future, setFuture] = useState<T[]>([]);
  const [dirtyTick, setDirtyTick] = useState(0); const [saveState, setSaveState] = useState<"saved" | "dirty" | "saving">("saved");
  const saveRef = useRef(onSave);
  useEffect(() => { saveRef.current = onSave; }, [onSave]);
  const value = selected ? readDraftPath(draft, selected.path) : undefined;

  const change = (nextValue: unknown) => {
    if (!selected) return;
    const next = applyDraftPatch(draft, selected.path, nextValue);
    setPast((items) => [...items.slice(-19), draft]); setFuture([]); onDraftChange(next); setDirtyTick((tick) => tick + 1); setSaveState("dirty");
  };
  useEffect(() => {
    if (!dirtyTick || !onSave) return;
    setSaveState("saving");
    const timer = window.setTimeout(() => {
      void Promise.resolve(saveRef.current?.()).then(() => setSaveState("saved")).catch(() => setSaveState("dirty"));
    }, 600);
    return () => window.clearTimeout(timer);
  }, [dirtyTick]);
  const undo = () => { const previous = past[past.length - 1]; if (!previous) return; setPast((items) => items.slice(0, -1)); setFuture((items) => [draft, ...items]); onDraftChange(previous); };
  const redo = () => { const next = future[0]; if (!next) return; setFuture((items) => items.slice(1)); setPast((items) => [...items, draft]); onDraftChange(next); };
  const visibleFields = fields.filter((field) => isVip || field.type !== "effect" || !field.allowedValues?.includes("GIFT_BOX"));

  return <div className="grid min-h-[680px] gap-4 lg:grid-cols-[180px_minmax(320px,1fr)_260px]">
    <aside className="order-2 rounded-2xl border border-stone-200 bg-white p-3 lg:order-1"><p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-stone-500">Chỉnh trực tiếp</p><div className="flex gap-2 overflow-x-auto lg:block lg:space-y-1">{visibleFields.map((field) => <button key={field.id} type="button" onClick={() => setSelected(field)} className={`block min-h-10 shrink-0 rounded-lg px-3 text-left text-sm transition lg:w-full ${selected?.id === field.id ? "bg-amber-50 font-semibold text-amber-900" : "text-stone-600 hover:bg-stone-50"}`}>{field.label}</button>)}</div><div className="mt-4 hidden gap-1 border-t border-stone-100 pt-3 lg:flex"><button type="button" aria-label="Hoàn tác" onClick={undo} disabled={!past.length} className="rounded p-2 disabled:opacity-30"><Undo2 className="size-4"/></button><button type="button" aria-label="Làm lại" onClick={redo} disabled={!future.length} className="rounded p-2 disabled:opacity-30"><Redo2 className="size-4"/></button></div></aside>
    <section className="order-1 min-w-0 rounded-2xl border border-stone-200 bg-stone-100 p-3 lg:order-2"><div className="mb-2 flex items-center justify-between text-xs text-stone-500"><span>Preview trực tiếp</span><span aria-live="polite" className="inline-flex items-center gap-1 text-emerald-700"><Check className="size-3"/>{saveState === "saving" ? "Đang lưu..." : saveState === "dirty" ? "Chưa lưu" : "Đã lưu"}</span></div><div className="relative mx-auto h-[620px] max-w-[390px] overflow-hidden rounded-[30px] bg-white shadow-inner"><div className="h-full overflow-y-auto">{children}</div><div className="pointer-events-none absolute inset-0 rounded-[30px] ring-1 ring-inset ring-black/5"/>{visibleFields.slice(0, 4).map((field, index) => <button key={field.id} type="button" aria-label={`Chỉnh ${field.label}`} title={`Bấm để chỉnh ${field.label}`} onClick={() => setSelected(field)} className={`absolute left-3 right-3 z-20 h-12 rounded-lg border border-dashed border-amber-500/0 bg-transparent transition hover:border-amber-500/60 hover:bg-amber-100/10 focus-visible:border-amber-600 focus-visible:outline-none ${index === 0 ? "top-20" : index === 1 ? "top-32" : index === 2 ? "top-44" : "bottom-20"}`}/>)}</div></section>
    <aside className="order-3 rounded-2xl border border-stone-200 bg-white p-4">{selected ? <><div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-semibold text-stone-900">{selected.label}</h2><button type="button" aria-label="Đóng chỉnh sửa" onClick={() => setSelected(null)}><X className="size-4 text-stone-400"/></button></div><Inspector field={selected} value={value} onChange={change} isVip={isVip}/></> : <div className="flex h-full min-h-32 items-center justify-center text-center text-sm text-stone-500">Bấm một nhóm bên trái để chỉnh trực tiếp preview</div>}{onSave && <button type="button" onClick={onSave} className="mt-6 min-h-10 w-full rounded-lg bg-stone-950 text-sm font-semibold text-white">Lưu bản nháp</button>}</aside>
  </div>;
}

function Inspector({ field, value, onChange, isVip }: { field: EditorField; value: unknown; onChange: (value: unknown) => void; isVip: boolean }) {
  if (field.type === "color") return <input aria-label={field.label} type="color" value={typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value : "#D4AF37"} onChange={(e) => onChange(e.target.value)} className="h-12 w-full cursor-pointer rounded-lg border"/>;
  if (field.type === "font" || field.type === "effect") return <select aria-label={field.label} value={typeof value === "string" ? value : ""} onChange={(e) => onChange(e.target.value)} className="h-10 w-full rounded-lg border border-stone-200 px-2 text-sm"><option value="">Mặc định</option>{field.allowedValues?.filter((option) => isVip || !["GATE_OPEN", "GIFT_BOX", "BALLOON"].includes(option)).map((option) => <option key={option} value={option}>{option}</option>)}</select>;
  if (field.type === "image") return <ImageInspector value={typeof value === "string" ? value : ""} onChange={onChange}/>;
  if (field.type === "music") return <MusicInspector value={typeof value === "string" ? value : ""} onChange={onChange}/>;
  return <textarea aria-label={field.label} value={typeof value === "string" ? value : ""} maxLength={field.maxLength} onChange={(e) => onChange(e.target.value)} rows={field.type === "text" ? 4 : 2} className="w-full rounded-lg border border-stone-200 p-2 text-sm"/>;
}

function ImageInspector({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null); const [error, setError] = useState(""); const [uploading, setUploading] = useState(false);
  async function choose(file?: File) {
    if (!file) return; if (!file.type.startsWith("image/")) return setError("Vui lòng chọn file ảnh");
    if (file.size > 10 * 1024 * 1024) return setError("Ảnh tối đa 10MB");
    setUploading(true); setError("");
    try {
      const url = await uploadSingleImage(file);
      if (url.startsWith("data:")) throw new Error("Không thể tải ảnh lên máy chủ. Vui lòng thử lại.");
      onChange(url);
    } catch (uploadError) { setError(uploadError instanceof Error ? uploadError.message : "Tải ảnh thất bại"); }
    finally { setUploading(false); }
  }
  return <div className="space-y-3"><div className="aspect-video overflow-hidden rounded-lg bg-stone-100">{value ? <img src={value} alt="Ảnh đang chọn" className="h-full w-full object-cover"/> : <div className="grid h-full place-items-center text-xs text-stone-400">Chưa có ảnh</div>}</div><input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { void choose(e.target.files?.[0]); e.target.value = ""; }}/><div className="flex gap-2"><button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="min-h-10 flex-1 rounded-lg bg-stone-900 px-3 text-sm font-medium text-white disabled:opacity-50">{uploading ? "Đang tải..." : "Đổi ảnh"}</button>{value && <button type="button" onClick={() => onChange("")} className="min-h-10 rounded-lg border border-rose-200 px-3 text-sm text-rose-700">Xóa</button>}</div>{error && <p role="alert" className="text-xs text-rose-600">{error}</p>}</div>;
}

const MUSIC_LIBRARY = [
  { name: "Ngày Đầu Tiên", src: "/music/ngay-dau-tien.mp3" },
  { name: "Lễ Đường", src: "/music/le-duong.mp3" },
  { name: "A Thousand Years", src: "/music/a-thousand-years.mp3" },
  { name: "Tắt nhạc", src: "" },
];
function MusicInspector({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [preview, setPreview] = useState<string | null>(null); const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => () => { audioRef.current?.pause(); }, []);
  const toggle = (src: string) => { if (!src) return; if (preview === src) { audioRef.current?.pause(); setPreview(null); } else { audioRef.current?.pause(); const audio = new Audio(src); audioRef.current = audio; void audio.play().catch(() => undefined); setPreview(src); } };
  return <div className="space-y-2">{MUSIC_LIBRARY.map((track) => <div key={track.src || "off"} className={`flex items-center justify-between rounded-lg border p-2 ${value === track.src ? "border-amber-400 bg-amber-50" : "border-stone-200"}`}><button type="button" onClick={() => onChange(track.src)} className="min-h-9 flex-1 text-left text-sm">{track.name}</button>{track.src && <button type="button" aria-label={`Nghe thử ${track.name}`} onClick={() => toggle(track.src)} className="rounded-md px-2 py-1 text-xs text-stone-500">{preview === track.src ? "Dừng" : "Nghe thử"}</button>}</div>)}</div>;
}
