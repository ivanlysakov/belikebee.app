# Changelog

Notable changes to BeLikeBee, newest first. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). `scripts/release-notes.sh` drafts the Unreleased section from the commits since the last tag.

## [Unreleased]

### Added

- The site is available in Ukrainian and English. Ukrainian is the default, a language switcher sits on every page, and your choice is remembered. Form errors on sign-up and sign-in appear in your language. (b04ca7b)
- Beekeepers can create apiaries and add hives to them on the new Apiaries page, reachable from the home page. (eaf10c5)
- Admins verify beekeepers on the new Beekeepers admin page. A beekeeper can manage apiaries and hives only after an admin has verified them. (601cb57)
- Anyone can browse every hive on the public Hives page, with each hive's apiary name and location, without signing in. Beekeepers' personal details are not shown. A "Browse hives" link is on the home page. (43f1678)
- Beekeepers can add a photo to each apiary and hive (JPEG, PNG or WebP, up to 5 MB). Photos appear in the apiary and hive lists and on the public Hives page. (3ea3fe9)

### Internal

- `pnpm admin:promote <email>` turns an existing user into the first admin. (601cb57)
- The test database reset now empties every table, so tables added by new modules start clean in each test run. (e03e290)
- E2E tests share helpers and use random emails, so parallel runs no longer clash. (eaf10c5)
- Release notes pipeline: `scripts/release-notes.sh` and a manual GitHub workflow draft this section from the commits since the last tag. (5f9f126)
- Claude Code setup: the belikebee plugin is enabled, and the hook that runs the changed modules' tests before a commit now ships with the plugin. (1cf4688, 5610022)
