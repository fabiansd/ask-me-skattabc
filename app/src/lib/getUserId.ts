import { Session } from "next-auth"

export function getUserId(session: Session | null): string {
  // For Google users, use their Google ID for lookup
  // For anonymous users, use "default"
  return session?.user?.id || "default"
}