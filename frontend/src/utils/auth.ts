export function validateEmail(value: string): string | null {
  return /^\S+@\S+$/.test(value) ? null : 'Invalid email';
}

export function validatePassword(value: string): string | null {
  return value.length > 0 ? null : 'Password is required';
}

export function validateConfirmPassword(
  value: string,
  values: { password: string },
): string | null {
  return value && value === values.password ? null : 'Passwords do not match';
}

export function validateName(value: string): string | null {
  return value.length > 0 ? null : 'Name is required';
}
