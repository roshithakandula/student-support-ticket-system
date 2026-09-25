"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Registration now lives as the "Create account" tab on /login for a single
 * unified auth screen. This route is kept so any existing links to
 * /register still land somewhere useful.
 */
export default function RegisterRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/login?mode=register");
  }, [router]);
  return null;
}
