import { cookies } from "next/headers";
import { DEMO_USER, getMemoryDb } from "@/lib/store/memory";
import type { User } from "@/lib/types";

export const SESSION_COOKIE = "proppulse_demo_user";

export async function getSessionUser(): Promise<User> {
  const jar = await cookies();
  const userId = jar.get(SESSION_COOKIE)?.value ?? DEMO_USER.id;
  const user = getMemoryDb().users.find((u) => u.id === userId);
  if (!user) {
    return getMemoryDb().users[0]!;
  }
  return user;
}

/** Cookie writes are only allowed in Route Handlers / Server Actions. */
export async function setSessionCookie(userId: string = DEMO_USER.id) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}
