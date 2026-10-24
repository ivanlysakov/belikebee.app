import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ApiarySummary } from "../apiaries";

export function ApiaryList({ apiaries }: { apiaries: ApiarySummary[] }) {
  const t = useTranslations("apiary.list");
  if (apiaries.length === 0) return <p className="text-sm text-muted-foreground">{t("empty")}</p>;

  return (
    <ul className="grid gap-3">
      {apiaries.map((apiary) => (
        <li key={apiary.id}>
          <Link href={`/apiaries/${apiary.id}`} className="font-medium underline">
            {apiary.name}
          </Link>
          <p className="text-sm text-muted-foreground">
            {apiary.location} · {t("hiveCount", { count: apiary._count.hives })}
          </p>
        </li>
      ))}
    </ul>
  );
}
