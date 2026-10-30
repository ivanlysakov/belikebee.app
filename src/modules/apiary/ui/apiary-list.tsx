import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ApiarySummary } from "../apiaries";
import { Photo } from "./photo";

export function ApiaryList({ apiaries }: { apiaries: ApiarySummary[] }) {
  const t = useTranslations("apiary.list");
  if (apiaries.length === 0) return <p className="type-muted">{t("empty")}</p>;

  return (
    <ul className="grid gap-3">
      {apiaries.map((apiary) => (
        <li key={apiary.id}>
          <Photo url={apiary.photoUrl} alt={apiary.name} />
          <Link href={`/apiaries/${apiary.id}`} className="font-medium underline">
            {apiary.name}
          </Link>
          <p className="type-muted">
            {apiary.location} · {t("hiveCount", { count: apiary._count.hives })}
          </p>
        </li>
      ))}
    </ul>
  );
}
