# Identity & User Context

Who the user is and what they are allowed to do. Every other context refers to users only by `userId`.

## Owns

- **User**: an authenticated individual.
- **Role**: access level, one of `Client`, `Beekeeper`, `Admin`.
- **Profile**: personal details, contact info (email, phone, Telegram handle), notification preferences.
- Authentication: sign-up, sign-in, sessions (NextAuth).
- Beekeeper verification: an admin verifies a beekeeper (`User.beekeeperVerifiedAt`) at `/admin/beekeepers`; the first admin is made with `pnpm admin:promote <email>`.

## Publishes

- `UserRegistered`

## Consumes

- Nothing. This context is upstream of all others.

## Out of scope

- Subscriptions, payments, and payment methods → `billing`.
- Hive and apiary ownership → `apiary`.
- Delivering messages to users → `notifications` (this context only stores the preferences).
