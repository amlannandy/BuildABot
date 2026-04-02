export class FormValidationUtils {
  static validateEmail(value: string): string | null {
    return /^\S+@\S+$/.test(value) ? null : 'Invalid email';
  }

  static validatePassword(value: string): string | null {
    return value.length > 0 ? null : 'Password is required';
  }

  static validateConfirmPassword(value: string, values: { password: string }): string | null {
    return value && value === values.password ? null : 'Passwords do not match';
  }

  static validateName(value: string): string | null {
    return value.length > 0 ? null : 'Name is required';
  }
}
