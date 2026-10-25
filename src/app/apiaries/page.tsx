import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ApiaryList, CreateApiaryForm, currentBeekeeper, listApiaries } from "@/modules/apiary";

export default async function ApiariesPage() {
  const access = await currentBeekeeper();
  if (access.status === "error" && access.formError === "signInRequired") redirect("/sign-in");
  const t = await getTranslations("apiary");
  if (access.status === "error") return <p>{t(`errors.${access.formError}`)}</p>;

  const apiaries = await listApiaries(access.userId);

  return (
    <>
      <h1 className="type-title">{t("list.title")}</h1>
      <ApiaryList apiaries={apiaries} />
      <h2 className="type-section">{t("create.title")}</h2>
      <CreateApiaryForm />
    </>
  );
}
