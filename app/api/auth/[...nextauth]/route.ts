// Relative import (not the "@/auth" alias) so Turbopack resolves the root
// auth.ts deterministically for this deeply-nested catch-all route:
// app/api/auth/[...nextauth]/route.ts -> ../../../../auth.ts
import { handlers } from "../../../../auth";

export const { GET, POST } = handlers;
