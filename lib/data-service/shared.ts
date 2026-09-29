export function formatDateIndo(date: Date): string {
  try {
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).toUpperCase();
  } catch {
    return date.toISOString().split("T")[0];
  }
}