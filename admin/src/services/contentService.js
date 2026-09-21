import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

/** Same merge rule as the public site: blanks in `override` never wipe a default. */
export function mergeDefaults(base, override) {
  if (!isObj(override)) return base;
  const out = { ...base };
  for (const [k, val] of Object.entries(override)) {
    if (val === '' || val == null) continue;
    if (Array.isArray(val)) {
      if (val.length) out[k] = val;
    } else if (isObj(val) && isObj(base?.[k])) out[k] = mergeDefaults(base[k], val);
    else out[k] = val;
  }
  return out;
}

export async function getSiteContent(scope) {
  const snap = await getDoc(doc(db, 'siteContent', scope));
  return snap.exists() ? snap.data() : {};
}

export function saveSiteContent(scope, data, user) {
  return setDoc(doc(db, 'siteContent', scope), { ...data, updatedAt: serverTimestamp(), updatedBy: user.uid }, { merge: true });
}

export async function getSettings() {
  const snap = await getDoc(doc(db, 'settings', 'general'));
  return snap.exists() ? snap.data() : {};
}

export function saveSettings(data, user) {
  return setDoc(doc(db, 'settings', 'general'), { ...data, updatedAt: serverTimestamp(), updatedBy: user.uid }, { merge: true });
}
