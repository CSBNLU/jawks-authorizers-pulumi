import { Authorizer } from "./authorizer";
import { TokenDefaultClaimsSchema } from "./jwt-token-default-claims-schema";
import { TokenFactory } from "./token-factory";

export interface JWTModule<AccessTokenPayload, RefreshTokenPayload> {
  accessTokenAuthorizer: Authorizer<AccessTokenPayload>;
  accessTokenFactory: TokenFactory<AccessTokenPayload>;
  refreshTokenAuthorizer: Authorizer<RefreshTokenPayload>;
  refreshTokenFactory: TokenFactory<RefreshTokenPayload>;
  tokenDefaultClaimsSchemaFactory: () => TokenDefaultClaimsSchema;
}
