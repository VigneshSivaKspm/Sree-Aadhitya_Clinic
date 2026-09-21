import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_CONTENT, DEFAULT_SETTINGS } from '../config/site';
import { getSiteData } from '../services/contentService';
import { logError } from '../utils/errors';
import { mergeDefaults } from '../utils/merge';

const SiteContext = createContext(null);

/**
 * Provides site settings + page content. Defaults render immediately; values stored in
 * Firestore (settings/general, siteContent/*) are merged over them once loaded.
 */
export function SiteProvider({ children }) {
  const [remote, setRemote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getSiteData()
      .then((data) => !cancelled && setRemote(data))
      .catch((err) => logError('site-data', err))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => {
    const settings = mergeDefaults(DEFAULT_SETTINGS, remote?.settings);
    const content = {
      main: mergeDefaults(DEFAULT_CONTENT.main, remote?.main),
      ayurveda: mergeDefaults(DEFAULT_CONTENT.ayurveda, remote?.ayurveda),
      dental: mergeDefaults(DEFAULT_CONTENT.dental, remote?.dental),
    };
    /** Contact details for a practice: practice overrides fall back to group-wide settings. */
    const contactFor = (practice) => mergeDefaults(settings.contact, content[practice]?.contact);
    return { settings, content, contactFor, loading };
  }, [remote, loading]);

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used inside <SiteProvider>');
  return ctx;
}
