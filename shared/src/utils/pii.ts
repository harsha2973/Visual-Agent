/**
 * Utility functions for client-side PII detection and masking.
 */

export const SENSITIVE_INPUT_TYPES = new Set(['password', 'credit-card', 'ssn', 'pin']);

export const SENSITIVE_NAME_PATTERNS = [
  /password/i,
  /passcode/i,
  /secret/i,
  /cvv/i,
  /cc[-_]?num/i,
  /card[-_]?number/i,
  /ssn/i,
  /social[-_]?security/i,
];

export function isElementSensitive(
  inputType?: string,
  elementName?: string,
  elementId?: string,
): boolean {
  if (inputType && SENSITIVE_INPUT_TYPES.has(inputType.toLowerCase())) {
    return true;
  }

  const combined = `${elementName || ''} ${elementId || ''}`;
  return SENSITIVE_NAME_PATTERNS.some((pattern) => pattern.test(combined));
}
