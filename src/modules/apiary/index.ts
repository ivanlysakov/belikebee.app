// Public API of the apiary module. Other code may import only from this file.
import en from "./messages/en.json";
import uk from "./messages/uk.json";

export { currentBeekeeper } from "./access";
export { getApiary, listApiaries, listPublicHives } from "./apiaries";
export { AddHiveForm } from "./ui/add-hive-form";
export { ApiaryList } from "./ui/apiary-list";
export { CreateApiaryForm } from "./ui/create-apiary-form";
export { HiveList } from "./ui/hive-list";
export { PublicHiveList } from "./ui/public-hive-list";
// UI texts, merged with other modules' texts under the "apiary" namespace (src/app/i18n/messages.ts).
export const messages = { uk, en };
