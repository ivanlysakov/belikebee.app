import { getSession } from "@/modules/identity";

export type BeekeeperAccess =
  | { status: "ok"; userId: string }
  | { status: "error"; formError: "signInRequired" | "beekeepersOnly" };

// Every apiary action and page starts here: only a signed-in beekeeper manages apiaries.
export async function currentBeekeeper(): Promise<BeekeeperAccess> {
  const session = await getSession();
  if (!session) return { status: "error", formError: "signInRequired" };
  if (session.user.role !== "BEEKEEPER") return { status: "error", formError: "beekeepersOnly" };
  return { status: "ok", userId: session.user.id };
}
