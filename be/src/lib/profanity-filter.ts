/**
 * Bộ lọc từ ngữ không phù hợp cho Sổ lưu bút & Lời chúc
 */
const BANNED_WORDS = [
  "dm",
  "dmm",
  "vcl",
  "clgt",
  "đm",
  "đmm",
  "địt",
  "lồn",
  "cặc",
  "buồi",
  "chó đẻ",
  "khốn nạn",
];

export function containsProfanity(text: string): boolean {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return BANNED_WORDS.some((word) => lowerText.includes(word));
}

export function cleanProfanity(text: string): string {
  if (!text) return "";
  let result = text;
  BANNED_WORDS.forEach((word) => {
    const regex = new RegExp(word, "gi");
    result = result.replace(regex, "***");
  });
  return result;
}
