import "server-only";
import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient, isAuthConfigured } from "@/lib/auth/session";
import { UnauthorizedError } from "@/lib/server/errors";

/**
 * Authentication flow.
 *
 * Supabase Auth verifies the password; this module then resolves the app user,
 * links the Supabase identity once, and refuses accounts that are missing or
 * deactivated in the `users` table. The role always comes from that table.
 */

export async function signInAction(email: string, password: string) {
  if (!isAuthConfigured()) {
    throw new UnauthorizedError("Autentikasi belum dikonfigurasi pada server ini.");
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error || !data.user) {
    throw new UnauthorizedError("Email atau kata sandi salah.");
  }

  const user = await prisma.user.findFirst({
    where: { email: data.user.email },
    select: { id: true, authUserId: true, email: true, name: true, role: true, isActive: true },
  });

  if (!user || !user.isActive) {
    await supabase.auth.signOut();
    throw new UnauthorizedError("Akun tidak terdaftar atau sudah dinonaktifkan.");
  }

  const linked =
    user.authUserId === data.user.id
      ? user
      : await prisma.user.update({
          where: { id: user.id },
          data: { authUserId: data.user.id },
          select: { id: true, authUserId: true, email: true, name: true, role: true },
        });

  await prisma.auditLog.create({
    data: {
      userId: linked.id,
      action: "LOGIN",
      details: JSON.stringify({ authUserId: data.user.id }),
    },
  });

  return {
    user: {
      id: linked.id,
      email: linked.email,
      name: linked.name,
      role: linked.role,
    },
  };
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();

  await supabase.auth.signOut();

  if (data.user?.id) {
    const user = await prisma.user.findFirst({
      where: { authUserId: data.user.id },
      select: { id: true },
    });
    if (user) {
      await prisma.auditLog.create({
        data: { userId: user.id, action: "LOGOUT", details: null },
      });
    }
  }
}