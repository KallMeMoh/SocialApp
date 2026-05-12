export enum TokenType {
  Access = 'access',
  Refresh = 'refresh',
  PendingAuth = 'pending',
}

export enum AuthProvider {
  System = 'system',
  Google = 'google',
}

export function isTokenType(value: any): value is TokenType {
  return (
    Object.values(TokenType).findIndex((tokenType) => tokenType === value) !==
    -1
  );
}

export function isAuthProvider(value: any): value is AuthProvider {
  return (
    Object.values(AuthProvider).findIndex(
      (authProvider) => authProvider === value,
    ) !== -1
  );
}
