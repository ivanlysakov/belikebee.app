import Link from "next/link";
import { useTranslations } from "next-intl";
import type { PublicHive } from "../apiaries";
import { Photo } from "./photo";

export function PublicHiveList({ hives }: { hives: PublicHive[] }) {
  const t = useTranslations("apiary.browse");
  if (hives.length === 0) return <p className="type-muted">{t("empty")}</p>;

  return (
    <ul className="grid gap-3">
      {hives.map((hive) => (
        <li key={hive.id}>
          <Photo url={hive.photoUrl} alt={hive.name} />
          <Link href={`/hives/${hive.id}`} className="font-medium underline">
            {hive.name}
          </Link>
          <p className="type-muted">
            {hive.apiary.name} · {hive.apiary.location}
          </p>
          {hive.description && <p className="text-sm">{hive.description}</p>}
        </li>
      ))}
    </ul>
  );
}
