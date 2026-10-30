import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AddHiveForm, currentBeekeeper, getApiary, HiveList } from "@/modules/apiary";

export default async function ApiaryPage({ params }: { params: Promise<{ id: string }> }) {
  const access = await currentBeekeeper();
  if (access.status === "error" && access.formError === "signInRequired") redirect("/sign-in");
  const t = await getTranslations("apiary");
  if (access.status === "error") return <p>{t(`errors.${access.formError}`)}</p>;

  // Another beekeeper's apiary is a 404, the same as a missing one.
  const apiary = await getApiary(access.userId, (await params).id);
  if (!apiary) notFound();

  return (
    <>
      <Link href="/apiaries" className="text-sm underline">
        {t("nav.allApiaries")}
      </Link>
      <div>
        <h1 className="type-title">{apiary.name}</h1>
        <p className="type-muted">{apiary.location}</p>
      </div>
      <h2 className="type-section">{t("hives.title")}</h2>
      <HiveList hives={apiary.hives} />
      <h2 className="type-section">{t("addHive.title")}</h2>
      <AddHiveForm apiaryId={apiary.id} />
    </>
  );
}
