// Public API of the identity module. Other code may import only from this file.
import en from "./messages/en.json";
import uk from "./messages/uk.json";

export { authHandler, getSession } from "./auth";
// UI texts, merged with other modules' texts under the "identity" namespace (src/app/i18n/messages.ts).
export const messages = { uk, en };
export { SignInForm } from "./ui/sign-in-form";
export { SignOutButton } from "./ui/sign-out-button";
export { SignUpForm } from "./ui/sign-up-form";
