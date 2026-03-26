export type AuthErrorCode =
  | "DEMO_LOGIN_DISABLED_IN_STRICT_MODE"
  | "SESSION_SECRET_MISSING"
  | "INVALID_SESSION";

export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}
