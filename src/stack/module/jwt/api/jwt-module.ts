import { Authorizer } from './authorizer';
import { TokenFactory} from './token-factory';

export interface JWTModule<AccessTokenPayload, RefreshTokenPayload> {
	accessTokenAuthorizer: Authorizer<AccessTokenPayload>;
	accessTokenFactory: TokenFactory<AccessTokenPayload>;
	refreshTokenAuthorizer: Authorizer<RefreshTokenPayload>;
	refreshTokenFactory: TokenFactory<RefreshTokenPayload>;
}