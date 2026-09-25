import { DefaultSession } from "next-auth";

export type UserRole = "STUDENT" | "STAFF" | "ADMIN";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    name?: string | null;
    email?: string | null;
  }
}
