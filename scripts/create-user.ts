import "dotenv/config";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "../lib/prisma";
import type { Role } from "../lib/types";

const VALID_ROLES: readonly Role[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "OPERATOR",
  "JUDGE",
  "REFEREE",
];

function parseArgs(): Record<string, string> {
  const args: Record<string, string> = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        args[key] = next;
        i++;
      } else {
        args[key] = "true";
      }
    }
  }
  return args;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Environment variable ${name} belum diisi.`);
  return value;
}

async function main() {
  const args = parseArgs();
  let email = args.email;
  let name = args.name;
  let role = args.role as Role;
  let password = args.password;

  const isInteractive = Boolean(process.stdin.isTTY);

  if (!isInteractive && (!email || !password)) {
    throw new Error(
      "Argumen belum lengkap. Gunakan:\n" +
      "  npx tsx scripts/create-user.ts --email <email> --password <password> [--name \"<nama>\"] [--role <SUPER_ADMIN|ADMIN|OPERATOR|JUDGE|REFEREE>]"
    );
  }

  const rl = isInteractive ? readline.createInterface({ input, output }) : null;

  try {
    if (!email && rl) {
      email = await rl.question("Email (misal: admin@pagar.id): ");
    }
    email = email?.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      throw new Error("Email tidak valid.");
    }

    if (!name && rl) {
      name = await rl.question("Nama Lengkap (misal: Administrator): ");
    }
    name = name?.trim();
    if (!name) name = "Administrator";

    if (!role && rl) {
      console.log(`Role tersedia: ${VALID_ROLES.join(", ")}`);
      const enteredRole = (await rl.question("Role (default: SUPER_ADMIN): ")).trim().toUpperCase();
      role = (enteredRole as Role) || "SUPER_ADMIN";
    } else if (!role) {
      role = "SUPER_ADMIN";
    } else {
      role = role.trim().toUpperCase() as Role;
    }

    if (!VALID_ROLES.includes(role)) {
      throw new Error(`Role "${role}" tidak valid. Pilihan: ${VALID_ROLES.join(", ")}`);
    }

    if (!password && rl) {
      password = await rl.question("Password (minimal 8 karakter): ");
    }
    if (!password || password.length < 8) {
      throw new Error("Password wajib diisi dan minimal 8 karakter.");
    }
  } finally {
    if (rl) rl.close();
  }

  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`\nMemproses akun untuk: ${email} (${role})...`);

  // 1. Cari user di Supabase Auth
  let authUserId: string | null = null;
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`Gagal membaca auth.users: ${error.message}`);
    const found = data.users.find((u) => u.email?.toLowerCase() === email);
    if (found) {
      authUserId = found.id;
      break;
    }
    if (data.users.length < 200) break;
  }

  // 2. Buat atau perbarui di Supabase Auth
  if (authUserId) {
    const { error } = await supabase.auth.admin.updateUserById(authUserId, {
      password,
      email_confirm: true,
      user_metadata: { name, role },
    });
    if (error) throw new Error(`Gagal memperbarui sandi di Supabase Auth: ${error.message}`);
    console.log(`✓ Sandi dan metadata di Supabase Auth berhasil diperbarui`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role },
    });
    if (error) throw new Error(`Gagal membuat akun di Supabase Auth: ${error.message}`);
    authUserId = data.user.id;
    console.log(`✓ Akun baru dibuat di Supabase Auth`);
  }

  // 3. Simpan / perbarui di Prisma public.users
  const existingAppUser = await prisma.user.findFirst({
    where: { email },
  });

  if (existingAppUser) {
    await prisma.user.update({
      where: { id: existingAppUser.id },
      data: {
        name,
        role,
        isActive: true,
        authUserId,
      },
    });
    console.log(`✓ Data user di database (Prisma public.users) berhasil diperbarui`);
  } else {
    await prisma.user.create({
      data: {
        email,
        name,
        role,
        isActive: true,
        authUserId,
      },
    });
    console.log(`✓ Data user baru berhasil disimpan di database (Prisma public.users)`);
  }

  console.log(`
=========================================
SUKSES! User siap digunakan untuk login.
Email : ${email}
Role  : ${role}
Nama  : ${name}
=========================================
`);
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error("\nGAGAL:", message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
