export enum TokenTypeEnum {
  Access = 'access',
  Refresh = 'refresh',
  PendingAuth = 'pending',
}

export enum AuthProviderEnum {
  System = 'system',
  Google = 'google',
}

export function isTokenTypeEnum(value: any): value is TokenTypeEnum {
  return (
    Object.values(TokenTypeEnum).findIndex(
      (tokenType) => tokenType === value,
    ) !== -1
  );
}
