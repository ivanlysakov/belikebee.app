#!/usr/bin/env bash
# Draft release notes for the commits since the last tag into docs/CHANGELOG.md (suggest mode).
# Edits the working tree only: never commits or pushes. Review with `git diff docs/CHANGELOG.md`,
# share with `git diff > release.patch`.
#
# Usage: scripts/release-notes.sh [from-ref]   (default: the last tag, else the first commit)
# Auth:  ANTHROPIC_API_KEY from the environment (a CI secret), or a local `claude auth login` session.
# Out:   the notes JSON on stdout, progress on stderr.
# Exit:  0 ok or nothing to do, 1 bad input or state, 2 Claude run failed, 3 notes do not cover the commits.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "${root}"

changelog="docs/CHANGELOG.md"
max_turns=10

from="${1:-$(git describe --tags --abbrev=0 2>/dev/null || git rev-list --max-parents=0 HEAD | tail -1)}"
range="${from}..HEAD"
git rev-parse --verify --quiet "${from}^{commit}" >/dev/null || { echo "error: unknown ref ${from}" >&2; exit 1; }
[ -f "${changelog}" ] || { echo "error: ${changelog} not found" >&2; exit 1; }
git diff --quiet -- "${changelog}" || { echo "error: ${changelog} has uncommitted changes" >&2; exit 1; }

log_cmd="git log --no-merges --format='%h %ad %s%n%b' --date=short ${range}"
commits="$(git log --no-merges --format=%h "${range}")"
if [ -z "${commits}" ]; then
  echo "No commits in ${range}, nothing to do." >&2
  exit 0
fi
echo "Drafting notes for $(echo "${commits}" | wc -l | tr -d ' ') commits in ${range}..." >&2

prompt="You are writing release notes for BeLikeBee, a platform where clients rent beehives from verified beekeepers.

1. Run exactly this command to read the commits: ${log_cmd}
2. Read ${changelog}.
3. Edit ${changelog}: replace everything between the '## [Unreleased]' heading and the next '## ' heading (or the end of the file) with the new notes. Group bullets under '### Added', '### Changed', '### Fixed', '### Internal' in that order and leave out empty groups. Write each bullet for a beekeeper, client or admin reading the product changelog (Internal is for developers: tests, tooling, refactors). End each bullet with its commit hashes in parentheses, for example (eaf10c5). Do not change any other part of the file.
4. Reply with JSON matching the schema: from=${from}, to=HEAD, one entry per bullet with the same text (without the hashes). Every commit from step 1 must appear either in the commits of an entry or in skipped with a reason, and no other hashes may appear."

out="$(claude -p "${prompt}" \
  --output-format json \
  --json-schema "$(cat scripts/release-notes.schema.json)" \
  --max-turns "${max_turns}" \
  --tools Bash Read Edit \
  --allowed-tools "Bash(git log *)" "Read(docs/*)" "Edit(docs/**)" \
  --no-session-persistence)" || { echo "error: claude exited with an error" >&2; echo "${out:-}" >&2; exit 2; }

if [ "$(echo "${out}" | jq -r .subtype)" != "success" ] || [ "$(echo "${out}" | jq -r '.structured_output | type')" != "object" ]; then
  echo "error: no schema-valid result (subtype: $(echo "${out}" | jq -r .subtype))" >&2
  exit 2
fi
notes="$(echo "${out}" | jq .structured_output)"
echo "Claude: $(echo "${out}" | jq -r .num_turns) turns, \$$(echo "${out}" | jq -r '.total_cost_usd * 100 | round / 100')" >&2

# Coverage: each commit is covered exactly by the notes, and each noted commit is in the changelog diff.
covered="$(echo "${notes}" | jq -r '.entries[].commits[], .skipped[].commit' | sort -u)"
noted="$(echo "${notes}" | jq -r '.entries[].commits[]' | sort -u)"
added_lines="$(git diff -U0 -- "${changelog}" | grep '^+' || true)"
missing=0
for c in ${commits}; do
  echo "${covered}" | grep -q "^${c}" || { echo "missing from notes: ${c}" >&2; missing=1; }
done
for c in ${covered}; do
  echo "${commits}" | grep -q "^${c:0:7}" || { echo "not in ${range}: ${c}" >&2; missing=1; }
done
for c in ${noted}; do
  echo "${added_lines}" | grep -q "${c:0:7}" || { echo "not in ${changelog}: ${c}" >&2; missing=1; }
done
[ "${missing}" -eq 0 ] || exit 3

echo "${notes}"
echo "Done. Review: git diff ${changelog}" >&2
