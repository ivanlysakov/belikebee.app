import "@fontsource-variable/alegreya";
import "@fontsource-variable/alegreya/wght-italic.css";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { PublicHiveProfile } from "../apiaries";
import { Photo } from "./photo";

// The serif is the hive's and the beekeeper's voice; the platform speaks in the app's sans.
export function HiveProfile({ hive }: { hive: PublicHiveProfile }) {
  const t = useTranslations("apiary");

  return (
    <article className="theme-apiary grid gap-8 text-foreground">
      <div aria-hidden className="fixed inset-0 -z-10 bg-background">
        <div className="absolute inset-0 bg-comb-cell wax-foundation" />
      </div>

      {hive.photoUrl && (
        // A frame lifted out of the hive: the top bar sticks out past the comb on both sides.
        <div>
          <div className="-mx-3 h-2 bg-hive-frame" />
          <div className="border-x-4 border-b-4 border-hive-frame">
            <Photo url={hive.photoUrl} alt={hive.name} variant="hero" />
          </div>
        </div>
      )}

      <div className="grid gap-3">
        <h1 className="font-serif text-5xl leading-none font-medium text-balance break-words">{hive.name}</h1>
        <p className="type-muted">{hive.apiary.location}</p>
      </div>

      {hive.description && <p className="font-serif text-lg leading-relaxed whitespace-pre-line">{hive.description}</p>}

      <div>
        <p className="font-serif text-lg italic">{hive.apiary.name}</p>
        <p className="type-muted">{t("profile.apiaryHives", { count: hive.apiary.hiveCount })}</p>
      </div>

      <section className="grid gap-2">
        <hr className="w-12 border-hive-frame" />
        <h2 className="font-medium">{t("profile.rentalTitle")}</h2>
        <p className="type-muted">{t("profile.rentalBody")}</p>
      </section>

      <Link href="/hives" className="text-sm underline">
        {t("nav.browseHives")}
      </Link>
    </article>
  );
}
