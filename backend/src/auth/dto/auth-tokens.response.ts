export class AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;

  constructor(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.tokenType = 'Bearer';
  }
}
