// Reference definitions of the naming rules in the standard (§8, §9), written as plain character
// logic rather than as copies of the ruleset's regular expressions. The property tests check that
// the Spectral ruleset agrees with these on generated input, so a regex that drifts from the
// standard's wording fails a test instead of slipping through review.
//
// Pure: no IO, no clock, no randomness.

const isLower = (c: string): boolean => c >= "a" && c <= "z";
const isUpper = (c: string): boolean => c >= "A" && c <= "Z";
const isDigit = (c: string): boolean => c >= "0" && c <= "9";

/** UTF-16 code units. Every rule here is ASCII-only, so any non-ASCII unit simply fails it. */
const units = (s: string): string[] => Array.from({ length: s.length }, (_, i) => s.charAt(i));

/** §8: a literal path segment is lowercase words of letters and digits joined by single hyphens. */
export function isKebabSegment(segment: string): boolean {
  if (segment.length === 0) return false;
  const words = segment.split("-");
  return words.every((w) => w.length > 0 && units(w).every((c) => isLower(c) || isDigit(c)));
}

/** §8, §9: camelCase starts with a lowercase letter and uses only letters and digits. */
export function isCamelCase(name: string): boolean {
  const [first, ...rest] = units(name);
  if (first === undefined || !isLower(first)) return false;
  return rest.every((c) => isLower(c) || isUpper(c) || isDigit(c));
}

/** §8: a path parameter segment is `{name}` with a camelCase name. */
export function isParameterSegment(segment: string): boolean {
  return segment.startsWith("{") && segment.endsWith("}") && isCamelCase(segment.slice(1, -1));
}

/** §8: every segment of a path is either a kebab-case literal or a camelCase parameter. */
export function isWellFormedPath(path: string): boolean {
  if (!path.startsWith("/")) return false;
  const segments = path.slice(1).split("/");
  return segments.every((s) => isKebabSegment(s) || isParameterSegment(s));
}

/** §12: the path begins with a major version segment, `v` followed by a number with no leading zero. */
export function isVersionedPath(path: string): boolean {
  const first = path.split("/")[1] ?? "";
  if (!first.startsWith("v") || first.length < 2) return false;
  const digits = first.slice(1);
  // The version must be followed by a further segment boundary: `/v1/...`, never a bare `/v1`.
  return units(digits).every(isDigit) && !digits.startsWith("0") && path.split("/").length >= 3;
}
