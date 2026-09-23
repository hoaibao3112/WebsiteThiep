"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useEditor } from "../EditorContext";
import { Music, Play, Pause, Check, Upload, VolumeX, Search } from "lucide-react";

const MUSIC_LIBRARY = [
  { id: "le-duong", name: "Lễ Đường (Nhạc Cưới Truyền Thống)", artist: "Traditional", src: "/music/le-duong.mp3", category: "vn" },
  { id: "until-i-found-you", name: "Until I Found You", artist: "Stephen Sanchez", src: "/music/until-i-found-you.mp3", category: "intl" },
  { id: "i-do", name: "I Do", artist: "911 Band", src: "/music/i-do.mp3", category: "intl" },
  { id: "a-thousand-years", name: "A Thousand Years", artist: "Christina Perri", src: "/music/a-thousand-years.mp3", category: "intl" },
  { id: "perfect", name: "Perfect", artist: "Ed Sheeran", src: "/music/perfect.mp3", category: "intl" },
  { id: "hon-ca-yeu", name: "Hơn Cả Yêu", artist: "Đức Phúc", src: "/music/hon-ca-yeu.mp3", category: "vn" },
  { id: "beautiful-in-white", name: "Beautiful In White", artist: "Shane Filan", src: "/music/beautiful-in-white.mp3", category: "intl" },
  { id: "die-with-a-smile", name: "Die With A Smile", artist: "Lady Gaga & Bruno Mars", src: "/music/die-with-a-smile.mp3", category: "intl" },
  { id: "ngay-dau-tien", name: "Ngày Đầu Tiên", artist: "Đức Phúc", src: "/music/ngay-dau-tien.mp3", category: "vn" },
  { id: "marry-you", name: "Marry You", artist: "Bruno Mars", src: "/music/marry-you.mp3", category: "intl" },
  { id: "mot-nha", name: "Một Nhà", artist: "Da LAB", src: "/music/mot-nha.mp3", category: "vn" },
  { id: "xin-ma-ruoc-dau", name: "Xin Má Rước Dâu", artist: "Diệu Kiên", src: "/music/xin-ma-ruoc-dau.mp3", category: "vn" },
  { id: "everytime-we-touch", name: "Everytime We Touch (Acoustic)", artist: "Cascada", src: "/music/everytime-we-touch.mp3", category: "intl" },
  { id: "like-my-father", name: "Like My Father", artist: "Jax", src: "/music/like-my-father.mp3", category: "intl" },
];

export function MusicTool() {
  const { fields, updateFieldById, getFieldValue } = useEditor();
  const [tab, setTab] = useState<"library" | "upload">("library");
  const [filterCat, setFilterCat] = useState<"all" | "vn" | "intl">("all");
  const [search, setSearch] = useState("");
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const musicField = fields.find((f) => f.id === "music");
  const currentMusic = musicField ? (getFieldValue(musicField) as string) || "" : "";

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const togglePreview = (src: string) => {
    if (!src) return;
    if (previewSrc === src) {
      audioRef.current?.pause();
      setPreviewSrc(null);
    } else {
      audioRef.current?.pause();
      const audio = new Audio(src);
      audioRef.current = audio;
      void audio.play().catch(() => {});
      setPreviewSrc(src);
      audio.onended = () => setPreviewSrc(null);
    }
  };

  const filtered = useMemo(() => {
    return MUSIC_LIBRARY.filter((item) => {
      if (filterCat !== "all" && item.category !== filterCat) return false;
      if (search) {
        const q = search.toLowerCase();
        return item.name.toLowerCase().includes(q) || item.artist.toLowerCase().includes(q);
      }
      return true;
    });
  }, [filterCat, search]);

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateFieldById("music", reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
          Nhạc Nền Thiệp
        </h3>
        <p className="text-[11px] text-stone-400">
          Tự động phát khi khách mời mở thiệp cưới của bạn.
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-xl">
        <button
          type="button"
          onClick={() => setTab("library")}
          className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
            tab === "library" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          Thư Viện ({MUSIC_LIBRARY.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("upload")}
          className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
            tab === "upload" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          Tải Nhạc Lên
        </button>
      </div>

      {tab === "library" ? (
        <div className="space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Tìm tên bài hát hoặc ca sĩ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-8 pr-3 rounded-xl border border-stone-200 text-xs bg-white text-stone-800 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Filter categories */}
          <div className="flex gap-1">
            {[
              { id: "all", label: "Tất cả" },
              { id: "vn", label: "Nhạc Việt" },
              { id: "intl", label: "Quốc tế" },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setFilterCat(c.id as any)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                  filterCat === c.id
                    ? "bg-amber-100 text-amber-900 font-bold"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Turn off option */}
          <button
            type="button"
            onClick={() => updateFieldById("music", "")}
            className={`w-full p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
              !currentMusic
                ? "bg-stone-900 text-white border-stone-900"
                : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <VolumeX className="size-4 shrink-0" />
              <span>Tắt nhạc nền (Không phát nhạc)</span>
            </div>
            {!currentMusic && <Check className="size-4 text-emerald-400" />}
          </button>

          {/* Song list */}
          <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
            {filtered.map((song) => {
              const isSelected = currentMusic === song.src;
              const isPlaying = previewSrc === song.src;

              return (
                <div
                  key={song.id}
                  className={`p-2.5 rounded-xl border transition flex items-center justify-between gap-2 ${
                    isSelected
                      ? "bg-amber-50 border-amber-400 shadow-2xs"
                      : "bg-white border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => updateFieldById("music", song.src)}
                    className="flex-1 text-left min-w-0 cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <Music className="size-3 text-stone-400 shrink-0" />
                      <span className="text-xs font-bold text-stone-800 truncate block">
                        {song.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-400 block truncate mt-0.5">
                      {song.artist}
                    </span>
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      aria-label="Nghe thử"
                      onClick={() => togglePreview(song.src)}
                      className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 cursor-pointer"
                    >
                      {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                    </button>
                    {isSelected && (
                      <span className="p-1 text-emerald-600">
                        <Check className="size-4" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <input
            ref={uploadInputRef}
            type="file"
            accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg"
            className="hidden"
            onChange={handleCustomUpload}
          />
          <div
            onClick={() => uploadInputRef.current?.click()}
            className="p-6 rounded-2xl border-2 border-dashed border-stone-300 hover:border-amber-400 bg-stone-50 text-center cursor-pointer space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 shadow-2xs flex items-center justify-center text-amber-600 mx-auto">
              <Upload className="size-5" />
            </div>
            <p className="text-xs font-bold text-stone-800">Tải file MP3 của riêng bạn</p>
            <p className="text-[10px] text-stone-400">Dung lượng tối đa 15MB (.mp3, .wav, .m4a)</p>
          </div>
        </div>
      )}
    </div>
  );
}
