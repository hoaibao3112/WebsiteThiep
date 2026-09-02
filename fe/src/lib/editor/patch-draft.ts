import { isAllowedEditorPath } from "./template-registry";

const forbidden = new Set(["__proto__", "constructor", "prototype"]);
function pathParts(path: string) {
  const parts = path.split(".");
  if (!parts.length || parts.some((part) => !/^[A-Za-z][A-Za-z0-9_]*$/.test(part) || forbidden.has(part)) || !isAllowedEditorPath(path)) throw new Error("Field không được phép chỉnh sửa");
  return parts;
}
export function readDraftPath<T extends object>(draft: T, path: string): unknown {
  return pathParts(path).reduce<unknown>((current, key) => current && typeof current === "object" ? (current as Record<string, unknown>)[key] : undefined, draft);
}
export function applyDraftPatch<T extends object>(draft: T, path: string, value: unknown): T {
  const parts = pathParts(path); const next = structuredClone(draft) as Record<string, unknown>; let cursor = next;
  for (const part of parts.slice(0, -1)) { const child = cursor[part]; if (!child || typeof child !== "object" || Array.isArray(child)) throw new Error("Field không hợp lệ"); cursor = child as Record<string, unknown>; }
  cursor[parts[parts.length - 1]] = value; return next as T;
}
