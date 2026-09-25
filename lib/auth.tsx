"use client";

/**
 * Compatibility layer: existing pages (create-ticket, dashboard, ticket
 * detail) were built against a `useAuth()` hook exposing
 * { user, loading, logout }. Rather than rewrite every consumer, this file
 * now re-implements that same interface on top of real NextAuth sessions,
 * so route protection, JWTs and the database are all real while the rest
 * of the app is untouched.
 */
import { SessionProvider, useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { User, UserRole } from "./types";

export { SessionProvider as AuthProvider };

export function useAuth() {
  const { data: session, status } = useSession();

  const user: User | null = session?.user
    ? {
        id: session.user.id,
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        role: (session.user.role.toLowerCase() as UserRole),
      }
    : null;

  return {
    user,
    loading: status === "loading",
    // Real sign-in now happens via next-auth/react's `signIn()` directly
    // from app/login/page.tsx and app/register/page.tsx.
    login: () => {},
    logout: () => nextAuthSignOut({ callbackUrl: "/login" }),
  };
}
