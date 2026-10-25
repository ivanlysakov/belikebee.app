import { notFound } from "next/navigation";
import { getPublicHive, HiveProfile } from "@/modules/apiary";

// Public: no sign-in needed, like /hives.
export default async function HivePage({ params }: { params: Promise<{ id: string }> }) {
  const hive = await getPublicHive((await params).id);
  if (!hive) notFound();

  return <HiveProfile hive={hive} />;
}
