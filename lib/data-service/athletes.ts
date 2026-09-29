import { prisma } from "@/lib/prisma";
import { Athlete } from "@/lib/types";

export async function getAthletes(): Promise<Athlete[]> {
  try {
    const list = await prisma.athlete.findMany({
      include: {
        contingent: true,
        category: true,
      },
      orderBy: { name: "asc" },
    });

    if (!list.length) return [];

    return list.map((athlete) => ({
      id: athlete.id,
      name: athlete.name,
      contingent: athlete.contingent.name,
      contingentCode: athlete.contingent.code,
      gender: athlete.gender as "PUTRA" | "PUTRI",
      weightClass: athlete.category.categoryClass,
      avatarUrl: athlete.avatarUrl || undefined,
      seed: athlete.seed || undefined,
    }));
  } catch (error) {
    console.error("Error in getAthletes:", error);
    return [];
  }
}

export async function createAthleteAction(data: {
  name: string;
  contingentName: string;
  contingentCode?: string;
  gender: "PUTRA" | "PUTRI";
  weightClassName?: string;
}) {
  try {
    const tournament = await prisma.tournament.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!tournament) throw new Error("Turnamen belum tersedia.");

    let contingent = await prisma.contingent.findFirst({
      where: {
        tournamentId: tournament.id,
        name: { equals: data.contingentName, mode: "insensitive" },
      },
    });

    if (!contingent) {
      contingent = await prisma.contingent.create({
        data: {
          tournamentId: tournament.id,
          name: data.contingentName.toUpperCase(),
          code: (data.contingentCode || data.contingentName.slice(0, 3)).toUpperCase(),
        },
      });
    }

    let category = await prisma.category.findFirst({
      where: {
        tournamentId: tournament.id,
        gender: data.gender,
      },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          tournamentId: tournament.id,
          name: `TANDING - ${data.weightClassName || "KELAS A"} ${data.gender}`,
          categoryClass: data.weightClassName || "KELAS A (45-50 kg)",
          gender: data.gender,
          type: "TANDING",
        },
      });
    }

    const newAthlete = await prisma.athlete.create({
      data: {
        contingentId: contingent.id,
        categoryId: category.id,
        name: data.name.toUpperCase(),
        gender: data.gender,
        medicalCleared: true,
      },
      include: {
        contingent: true,
        category: true,
      },
    });

    return {
      success: true,
      data: {
        id: newAthlete.id,
        name: newAthlete.name,
        contingent: newAthlete.contingent.name,
        contingentCode: newAthlete.contingent.code,
        gender: newAthlete.gender as "PUTRA" | "PUTRI",
        weightClass: newAthlete.category.categoryClass,
      },
    };
  } catch (error: any) {
    console.error("Failed to create athlete:", error);
    return { success: false, error: error?.message || "Gagal menyimpan atlet" };
  }
}

export async function updateAthleteAction(
  id: string,
  data: {
    name: string;
    contingentName: string;
    contingentCode?: string;
    gender: "PUTRA" | "PUTRI";
    weightClassName: string;
  }
) {
  try {
    const athlete = await prisma.athlete.findUnique({
      where: { id },
      include: { contingent: true, category: true },
    });

    if (!athlete) {
      return { success: false, status: 404, error: "Atlet tidak ditemukan." };
    }

    const name = data.name.trim();
    const contingentName = data.contingentName.trim();
    const contingentCode = data.contingentCode?.trim().toUpperCase();
    const weightClassName = data.weightClassName.trim();

    if (!name || !contingentName || !weightClassName) {
      return { success: false, status: 400, error: "Data atlet belum lengkap." };
    }

    const contingentChanged =
      contingentName.toLowerCase() !== athlete.contingent.name.toLowerCase() ||
      (contingentCode !== undefined && contingentCode !== athlete.contingent.code);
    const categoryChanged =
      data.gender !== athlete.gender || weightClassName !== athlete.category.categoryClass;

    if (contingentChanged || categoryChanged) {
      const matchCount = await prisma.match.count({
        where: { OR: [{ redAthleteId: id }, { blueAthleteId: id }] },
      });

      if (matchCount > 0) {
        return {
          success: false,
          status: 409,
          error: "Kontingen, gender, dan kelas tidak dapat diubah setelah atlet masuk pertandingan.",
        };
      }
    }

    let contingent = athlete.contingent;
    if (contingentName.toLowerCase() !== athlete.contingent.name.toLowerCase()) {
      const existingContingent = await prisma.contingent.findFirst({
        where: {
          tournamentId: athlete.contingent.tournamentId,
          name: { equals: contingentName, mode: "insensitive" },
        },
      });

      if (existingContingent) {
        contingent = existingContingent;
      } else {
        const code = contingentCode || contingentName.slice(0, 3).toUpperCase();
        const codeInUse = await prisma.contingent.findFirst({
          where: { tournamentId: athlete.contingent.tournamentId, code },
        });

        if (codeInUse) {
          return { success: false, status: 409, error: "Kode kontingen sudah digunakan." };
        }

        contingent = await prisma.contingent.create({
          data: {
            tournamentId: athlete.contingent.tournamentId,
            name: contingentName.toUpperCase(),
            code,
          },
        });
      }
    } else if (contingentCode && contingentCode !== athlete.contingent.code) {
      const codeInUse = await prisma.contingent.findFirst({
        where: {
          tournamentId: athlete.contingent.tournamentId,
          code: contingentCode,
          NOT: { id: athlete.contingent.id },
        },
      });

      if (codeInUse) {
        return { success: false, status: 409, error: "Kode kontingen sudah digunakan." };
      }

      contingent = await prisma.contingent.update({
        where: { id: athlete.contingent.id },
        data: { code: contingentCode },
      });
    }

    let category = athlete.category;
    if (categoryChanged) {
      const existingCategory = await prisma.category.findFirst({
        where: {
          tournamentId: athlete.contingent.tournamentId,
          gender: data.gender,
          categoryClass: weightClassName,
        },
      });

      if (existingCategory) {
        category = existingCategory;
      } else {
        category = await prisma.category.create({
          data: {
            tournamentId: athlete.contingent.tournamentId,
            name: `TANDING - ${weightClassName} ${data.gender}`,
            categoryClass: weightClassName,
            gender: data.gender,
            type: "TANDING",
          },
        });
      }
    }

    const updated = await prisma.athlete.update({
      where: { id },
      data: {
        name: name.toUpperCase(),
        gender: data.gender,
        contingentId: contingent.id,
        categoryId: category.id,
      },
      include: { contingent: true, category: true },
    });

    return {
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        contingent: updated.contingent.name,
        contingentCode: updated.contingent.code,
        gender: updated.gender as "PUTRA" | "PUTRI",
        weightClass: updated.category.categoryClass,
        avatarUrl: updated.avatarUrl || undefined,
        seed: updated.seed || undefined,
      },
    };
  } catch (error: unknown) {
    console.error("Failed to update athlete:", error);
    return { success: false, status: 500, error: "Gagal memperbarui data atlet." };
  }
}

export async function deleteAthleteAction(id: string) {
  try {
    const athlete = await prisma.athlete.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!athlete) {
      return { success: false, status: 404, error: "Atlet tidak ditemukan." };
    }

    const matchCount = await prisma.match.count({
      where: { OR: [{ redAthleteId: id }, { blueAthleteId: id }] },
    });

    if (matchCount > 0) {
      return {
        success: false,
        status: 409,
        error: "Atlet tidak dapat dihapus karena sudah terdaftar dalam pertandingan.",
      };
    }

    await prisma.athlete.delete({ where: { id } });
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to delete athlete:", error);
    return { success: false, status: 500, error: "Gagal menghapus data atlet." };
  }
}