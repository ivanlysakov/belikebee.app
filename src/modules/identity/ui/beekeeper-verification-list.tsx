import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/button";
import type { UnverifiedBeekeeper } from "../beekeepers";
import { verifyBeekeeperAction } from "../verify-beekeeper.action";

export function BeekeeperVerificationList({ beekeepers }: { beekeepers: UnverifiedBeekeeper[] }) {
  const t = useTranslations("identity.admin");
  if (beekeepers.length === 0) return <p className="text-sm text-muted-foreground">{t("empty")}</p>;

  return (
    <ul className="grid gap-3">
      {beekeepers.map((beekeeper) => (
        <li key={beekeeper.id} className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium">{beekeeper.profile?.name}</p>
            <p className="text-sm text-muted-foreground">{beekeeper.email}</p>
          </div>
          <form action={verifyBeekeeperAction}>
            <input type="hidden" name="userId" value={beekeeper.id} />
            <Button type="submit">{t("verify")}</Button>
          </form>
        </li>
      ))}
    </ul>
  );
}
