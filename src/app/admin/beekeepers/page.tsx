import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { BeekeeperVerificationList, getSession, listUnverifiedBeekeepers } from "@/modules/identity";

export default async function AdminBeekeepersPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  const t = await getTranslations("identity.admin");
  if (session.user.role !== "ADMIN") return <p>{t("adminsOnly")}</p>;

  return (
    <>
      <h1 className="type-title">{t("title")}</h1>
      <BeekeeperVerificationList beekeepers={await listUnverifiedBeekeepers()} />
    </>
  );
}
