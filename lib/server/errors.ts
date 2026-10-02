export class ValidationError extends Error {
  readonly status = 400;

  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends Error {
  readonly status = 401;

  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class NotFoundError extends Error {
  readonly status = 404;

  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends Error {
  readonly status = 409;

  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

export class ForbiddenError extends Error {
  readonly status = 403;

  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}

const STATUS_MESSAGES: Record<number, string> = {
  400: "Permintaan tidak valid.",
  401: "Tidak diizinkan.",
  403: "Akses ditolak.",
  404: "Data tidak ditemukan.",
  409: "Permintaan bertentangan dengan data saat ini.",
  500: "Terjadi kesalahan pada server.",
};

export function toStatus(error: unknown): number {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as { status: unknown }).status;
    if (typeof status === "number") return status;
  }
  return 500;
}

export function toPublicMessage(error: unknown, status: number): string {
  if (status >= 500) {
    return STATUS_MESSAGES[500];
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return STATUS_MESSAGES[status] ?? STATUS_MESSAGES[400];
}