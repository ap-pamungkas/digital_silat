import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Role } from "@/lib/types";
import { prisma } from "@/lib/prisma";
import { ForbiddenError, UnauthorizedError } from "@/lib/server/errors";

/**
 * Server side session helpers.
 *
 * Supabase Auth owns the credentials, the `users` table stays the single source
 * of truth for the role, so a role can never be escalated through Supabase
 * metadata. Only the publishable key is used; the service role key never
 * belongs in this module.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isAuthConfigured(): boolean {
  return Boolean(supabaseUrl && supabasePublishableKey);
}

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl ?? "", supabasePublishableKey ?? "", {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component where cookies are read-only; the
          // proxy refreshes the session on the next navigation.
        }
      },
    },
  });
}

export interface SessionUser {
  id: string;
  authUserId: string;
  email: string;
  name: string;
  role: Role;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.email) return null;

  const user = await prisma.user.findFirst({
    where: {
      isActive: true,
      OR: [{ authUserId: data.user.id }, { email: data.user.email }],
    },
    select: { id: true, authUserId: true, email: true, name: true, role: true },
  });

  if (!user) return null;

  const authUserId = user.authUserId ?? data.user.id;
  if (user.authUserId !== data.user.id) {
    await prisma.user.update({ where: { id: user.id }, data: { authUserId } });
  }

  return { id: user.id, authUserId, email: user.email, name: user.name, role: user.role };
}

export async function requireSessionUser(allowedRoles?: readonly Role[]): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new UnauthorizedError("Sesi tidak valid. Silakan masuk kembali.");
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new ForbiddenError("Anda tidak memiliki akses untuk tindakan ini.");
  }
  return user;
}

export const OPERATOR_ROLES: readonly Role[] = ["ADMIN", "SUPER_ADMIN", "OPERATOR"];
export const JUDGE_ROLES: readonly Role[] = ["JUDGE", "SUPER_ADMIN", "ADMIN"];
export const ADMIN_ROLES: readonly Role[] = ["ADMIN", "SUPER_ADMIN"];
export const SCORING_ROLES: readonly Role[] = [...JUDGE_ROLES, "OPERATOR"];