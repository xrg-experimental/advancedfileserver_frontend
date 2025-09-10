// Shared file/folder name validation utilities
// Provides reusable helpers for dialogs and forms

export interface NameValidatorOptions {
  // Label used in error messages for emptiness; defaults to 'Name'
  label?: string;
  // When true, prohibits names consisting only of dots (e.g., '.', '..', '...')
  forbidDotsOnly?: boolean;
}

const INVALID_CHARS_REGEX = /[<>:"/\\|?*]/;
const RESERVED_NAMES_REGEX = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
const DOTS_ONLY_REGEX = /^\.+$/;

export interface NameValidationResult {
  valid: boolean;
  error: string; // empty string when valid
}

export function nameValidator(
  name: string | null | undefined,
  options: NameValidatorOptions = {}
): NameValidationResult {
  const label = options.label ?? 'Name';
  const raw = name ?? '';
  const trimmed = raw.trim();

  if (!trimmed) {
    return { valid: false, error: `${label} cannot be empty` };
  }

  if (INVALID_CHARS_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: 'Name contains invalid characters: < > : " / \\ | ? *'
    };
  }

  if (RESERVED_NAMES_REGEX.test(trimmed)) {
    return { valid: false, error: 'This name is reserved by the system' };
  }

  if (options.forbidDotsOnly && DOTS_ONLY_REGEX.test(trimmed)) {
    return { valid: false, error: `${label} cannot be only dots` };
  }

  return { valid: true, error: '' };
}

export function isValidName(name: string | null | undefined, options?: NameValidatorOptions): boolean {
  return nameValidator(name, options).valid;
}

export function getNameValidationError(name: string | null | undefined, options?: NameValidatorOptions): string {
  return nameValidator(name, options).error;
}
