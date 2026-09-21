const isPlainObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

/**
 * Deep-merges `override` onto `base`. Empty strings / null / undefined / empty arrays in
 * `override` are ignored so a half-filled admin form never blanks out a sensible default.
 */
export function mergeDefaults(base, override) {
  if (!isPlainObject(override)) return base;
  const out = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (value === '' || value == null) continue;
    if (Array.isArray(value)) {
      if (value.length) out[key] = value;
    } else if (isPlainObject(value) && isPlainObject(base?.[key])) {
      out[key] = mergeDefaults(base[key], value);
    } else {
      out[key] = value;
    }
  }
  return out;
}
