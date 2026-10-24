import { useTranslations } from "next-intl";
import type { HiveSummary } from "../apiaries";

export function HiveList({ hives }: { hives: HiveSummary[] }) {
  const t = useTranslations("apiary.hives");
  if (hives.length === 0) return <p className="text-sm text-muted-foreground">{t("empty")}</p>;

  return (
    <ul className="grid gap-3">
      {hives.map((hive) => (
        <li key={hive.id}>
          <p className="font-medium">{hive.name}</p>
          {hive.description && <p className="text-sm text-muted-foreground">{hive.description}</p>}
        </li>
      ))}
    </ul>
  );
}
