export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateLoginForm(data: {
  identifier: string;
  password: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  // Validasi identifier (email atau username)
  if (!data.identifier || data.identifier.trim() === '') {
    errors.identifier = 'Email atau username wajib diisi';
  } else if (data.identifier.trim().length < 3) {
    errors.identifier = 'Email atau username minimal 3 karakter';
  }

  // Validasi password
  if (!data.password || data.password === '') {
    errors.password = 'Password wajib diisi';
  } else if (data.password.length < 6) {
    errors.password = 'Password minimal 6 karakter';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function isEmailFormat(value: string): boolean {
  return value.includes('@');
}
