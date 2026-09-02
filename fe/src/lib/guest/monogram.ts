function firstLetter(name?: string): string {
  const value = name?.normalize("NFKC").trim();
  return value ? Array.from(value)[0].toLocaleUpperCase("vi-VN") : "";
}

export function getMonogram(firstName?: string, secondName?: string): string {
  return [firstLetter(firstName), firstLetter(secondName)].filter(Boolean).join("·") || "♥";
}
