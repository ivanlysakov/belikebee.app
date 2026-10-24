import { getSession, isVerifiedBeekeeper } from "@/modules/identity";

export type BeekeeperAccess =
  | { status: "ok"; userId: string }
  | { status: "error"; formError: "signInRequired" | "beekeepersOnly" | "verificationPending" };

// Every apiary action and page starts here: only a signed-in, admin-verified beekeeper manages apiaries.
export async function currentBeekeeper(): Promise<BeekeeperAccess> {
  const session = await getSession();
  if (!session) return { status: "error", formError: "signInRequired" };
  if (session.user.role !== "BEEKEEPER") return { status: "error", formError: "beekeepersOnly" };
  if (!(await isVerifiedBeekeeper(session.user.id))) return { status: "error", formError: "verificationPending" };
  return { status: "ok", userId: session.user.id };
}
