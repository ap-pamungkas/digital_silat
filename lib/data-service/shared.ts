export type ActionStatus = 400 | 404 | 409 | 500;

export type ActionFailure = {
  success: false;
  status: ActionStatus;
  error: string;
};

export type ActionResult<T> = { success: true; data: T } | ActionFailure;

export type ActionResultVoid = { success: true } | ActionFailure;

export function toActionStatus(status: number): ActionStatus {
  if (status === 400 || status === 404 || status === 409) return status;
  return 500;
}

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

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function isPrismaUniqueConstraintError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}