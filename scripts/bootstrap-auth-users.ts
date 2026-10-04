import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "../lib/prisma";

/**
 * Creates the Supabase Auth account for every active `public.users` row and
 * links it back through `User.authUserId`.
 *
 * The service role key is only read here, server side, from the environment.
 * Passwords are never hardcoded and never logged: they come from
 * `AUTH_BOOTSTRAP_PASSWORD_<EMAIL PREFIX>` or from the shared
 * `AUTH_BOOTSTRAP_PASSWORD` fallback.
 *
 * Usage:
 *   npx tsx scripts/bootstrap-auth-users.ts           # report + create what is possible
 *   npx tsx scripts/bootstrap-auth-users.ts --dry-run # report only
 */

const DRY_RUN = process.argv.includes("--dry-run");

function passwordFor(email: string): string | undefined {
  const prefix = email.split("@")[0]?.replace(/[^a-z0-9]+/gi, "_").toUpperCase();
  const specific = prefix ? process.env[`AUTH_BOOTSTRAP_PASSWORD_${prefix}`] : undefined;
  return specific ?? process.env.AUTH_BOOTSTRAP_PASSWORD;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Environment variable ${name} belum diisi.`);
  return value;
}

async function main() {
  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const appUsers = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, email: true, name: true, role: true, authUserId: true },
    orderBy: { email: "asc" },
  });

  if (appUsers.length === 0) {
    console.log("Tidak ada user aktif di public.users. Jalankan `npm run seed` lebih dulu.");
    return;
  }

  const existing = new Map<string, string>();
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`Gagal membaca auth.users: ${error.message}`);
    for (const authUser of data.users) {
      if (authUser.email) existing.set(authUser.email.toLowerCase(), authUser.id);
    }
    if (data.users.length < 200) break;
  }

  let created = 0;
  let linked = 0;
  let skipped = 0;

  for (const appUser of appUsers) {
    const email = appUser.email.toLowerCase();
    const authUserId = existing.get(email);

    if (appUser.authUserId && authUserId && appUser.authUserId === authUserId) {
      skipped += 1;
      console.log(`= ${email} (${appUser.role}) sudah tertaut`);
      continue;
    }

    const password = passwordFor(appUser.email);

    if (!password) {
      console.log(
        `- ${email} (${appUser.role}) belum punya akun auth dan tidak ada password di environment`
      );
      continue;
    }

    if (DRY_RUN) {
      console.log(`- ${email} (${appUser.role}) akan dibuat${authUserId ? " (auth user ada, sandi diperbarui)" : ""}`);
      continue;
    }

    const { data, error } = authUserId
      ? await supabase.auth.admin.updateUserById(authUserId, {
        password,
        email_confirm: true,
      })
      : await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name: appUser.name, role: appUser.role },
      });

    if (error) throw new Error(`Gagal menyimpan ${email}: ${error.message}`);

    await prisma.user.update({
      where: { id: appUser.id },
      data: { authUserId: data.user.id },
    });

    if (authUserId) linked += 1;
    else created += 1;
    console.log(`+ ${email} (${appUser.role}) tersimpan`);
  }

  console.log(
    `\nRingkasan: ${created} dibuat, ${linked} diperbarui, ${skipped} sudah ok${DRY_RUN ? " (dry-run, tidak ada perubahan)" : ""
    }`
  );
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error("FAILED:", message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });