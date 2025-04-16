"use client";

import useRedirectBasedOnRole from "@/hooks/useRedirectBasedOnRole";

export default function RoleRedirector() {
  useRedirectBasedOnRole();
  return null;
}
