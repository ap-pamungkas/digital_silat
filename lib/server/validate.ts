import { z } from "zod";
import { ValidationError } from "./errors";

const FIELD_LABELS: Record<string, string> = {
  arenaId: "gelanggang",
  arenaCode: "kode gelanggang",
  arenaNumber: "nomor gelanggang",
  matchId: "partai",
  matchNumber: "nomor partido",
  redAthleteId: "atlet sudut merah",
  blueAthleteId: "atlet sudut biru",
  categoryId: "kategori",
  categoryName: "nama kategori",
  stage: "babak",
  scheduledDate: "tanggal",
  scheduledTime: "waktu mulai",
  status: "status",
  winnerCorner: "sudut pemenang",
  winReason: "alasan kemenangan",
  name: "nama",
  location: "lokasi",
  startDate: "tanggal mulai",
  endDate: "tanggal selesai",
  totalArenas: "jumlah gelanggang",
  contingent: "kontingen",
  contingentName: "kontingen",
  contingentCode: "kode kontingen",
  gender: "gender",
  weightClass: "kelas",
  weightClassName: "kelas",
  corner: "sudut",
  action: "jenis serangan",
  points: "nilai poin",
  judgeNumber: "nomor juri",
  judgeId: "juri",
  accessCode: "kode akses",
  matchTime: "waktu pertandingan",
  round: "nomor babak",
  decision: "keputusan",
  licenseNumber: "nomor lisensi",
  arena: "gelanggang",
  connectedJudgesCount: "jumlah juri terhubung",
  email: "email",
  password: "kata sandi",
};

export type Infer<T extends z.ZodType> = z.infer<T>;

function label(path: readonly PropertyKey[]): string {
  if (path.length === 0) return "data";
  const key = String(path[0]);
  return FIELD_LABELS[key] ?? key;
}

function humanize(issue: z.core.$ZodIssue): string {
  const field = label(issue.path);

  switch (issue.code) {
    case "invalid_type":
      return `${field} tidak valid.`;
    case "invalid_value":
      if (issue.values.length === 1) {
        return `${field} harus diisi dengan "${String(issue.values[0])}".`;
      }
      return `${field} tidak dikenali.`;
    case "too_small":
      return issue.origin === "string"
        ? `${field} minimal ${issue.minimum} karakter.`
        : `${field} minimal ${issue.minimum}.`;
    case "too_big":
      return issue.origin === "string"
        ? `${field} maksimal ${issue.maximum} karakter.`
        : `${field} maksimal ${issue.maximum}.`;
    case "invalid_key":
      return `${field} tidak dikenali.`;
    case "invalid_union":
      return `${field} tidak valid.`;
    case "custom":
      return issue.message;
    default:
      return `${field} tidak valid.`;
  }
}

export function firstIssueMessage(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "Permintaan tidak valid.";
  return humanize(issue);
}

export function toValidationError(error: unknown): ValidationError {
  if (error instanceof z.ZodError) {
    return new ValidationError(firstIssueMessage(error));
  }
  return new ValidationError("Permintaan tidak valid.");
}