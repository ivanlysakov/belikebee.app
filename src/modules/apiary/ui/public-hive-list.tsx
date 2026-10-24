import { useTranslations } from "next-intl";
import type { PublicHive } from "../apiaries";
import { Photo } from "./photo";

export function PublicHiveList({ hives }: { hives: PublicHive[] }) {
  const t = useTranslations("apiary.browse");
  if (hives.length === 0) return <p className="text-sm text-muted-foreground">{t("empty")}</p>;

  return (
    <ul className="grid gap-3">
      {hives.map((hive) => (
        <li key={hive.id}>
          <Photo url={hive.photoUrl} alt={hive.name} />
          <p className="font-medium">{hive.name}</p>
          <p className="text-sm text-muted-foreground">
            {hive.apiary.name} · {hive.apiary.location}
          </p>
          {hive.description && <p className="text-sm">{hive.description}</p>}
        </li>
      ))}
    </ul>
  );
}
