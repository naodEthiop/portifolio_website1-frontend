export function splitCsv(input: string) {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function joinCsv(items: string[]) {
  return (items || []).join(", ");
}

