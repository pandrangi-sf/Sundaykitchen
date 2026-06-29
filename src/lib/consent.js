// Versioned, granular consent. Bump CONSENT_VERSION when wording changes;
// users will be asked to re-accept. Each item is logged separately to the
// 'consents' table (consent_key + version + timestamp).

export const CONSENT_VERSION = '1.0.0';

export const CONSENT_ITEMS = [
  {
    key: 'terms',
    label: 'I agree to the Terms of Service.'
  },
  {
    key: 'privacy',
    label: 'I agree to the Privacy Policy.'
  },
  {
    key: 'health_processing',
    label: 'I consent to processing my health information to generate my plan.'
  },
  {
    key: 'not_medical_advice',
    label: 'I understand this is general wellness guidance, not medical advice.'
  }
];

export const REQUIRED_CONSENT_KEYS = CONSENT_ITEMS.map((c) => c.key);

// True only when every required key is accepted at the current version.
export function hasAllConsents(records) {
  if (!Array.isArray(records)) return false;
  return REQUIRED_CONSENT_KEYS.every((key) =>
    records.some((r) => r.consent_key === key && r.version === CONSENT_VERSION && r.accepted)
  );
}
