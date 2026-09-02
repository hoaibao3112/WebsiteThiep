export interface ParsedGuest { fullName: string; salutation?: string; group?: string; phone?: string }
export interface GuestParseError { row: number; message: string }

export function parseGuestText(text: string): { items: ParsedGuest[]; errors: GuestParseError[] } {
  const items: ParsedGuest[] = []; const errors: GuestParseError[] = [];
  text.split(/\r?\n/).forEach((raw, index) => {
    const line = raw.trim(); if (!line) return;
    const parts = line.split(line.includes("\t") ? "\t" : ",").map((part) => part.trim());
    const item = parts.length === 1 ? { fullName: parts[0] } : { salutation: parts[0], fullName: parts[1], group: parts[2] || undefined, phone: parts[3] || undefined };
    if (!item.fullName || item.fullName.length < 2) errors.push({ row: index + 1, message: "Tên khách phải có ít nhất 2 ký tự" });
    else items.push(item);
  });
  return { items, errors };
}
