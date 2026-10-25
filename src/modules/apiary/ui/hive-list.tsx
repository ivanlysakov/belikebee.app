import { useTranslations } from "next-intl";
import type { HiveSummary } from "../apiaries";
import { Photo } from "./photo";

export function HiveList({ hives }: { hives: HiveSummary[] }) {
  const t = useTranslations("apiary.hives");
  if (hives.length === 0) return <p className="type-muted">{t("empty")}</p>;

  return (
    <ul className="grid gap-3">
      {hives.map((hive) => (
        <li key={hive.id}>
          <Photo url={hive.photoUrl} alt={hive.name} />
          <p className="font-medium">{hive.name}</p>
          {hive.description && <p className="type-muted">{hive.description}</p>}
        </li>
      ))}
    </ul>
  );
}
