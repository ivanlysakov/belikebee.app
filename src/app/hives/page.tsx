import { getTranslations } from "next-intl/server";
import { listPublicHives, PublicHiveList } from "@/modules/apiary";

// Public: no sign-in needed.
export default async function HivesPage() {
  const t = await getTranslations("apiary.browse");

  return (
    <>
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <PublicHiveList hives={await listPublicHives()} />
    </>
  );
}
