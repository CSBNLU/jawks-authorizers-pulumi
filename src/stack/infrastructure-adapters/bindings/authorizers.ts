import { API } from "..";
import * as Implementation from "../implementation";
import { JWT } from "../../module";

export interface Dependencies<AccessTokenPayload, RefreshTokenPayload> {
  jwtModule: JWT.API.JWTModule<AccessTokenPayload, RefreshTokenPayload>;
}

export interface Props {
  authorizationHeader: string;
  authorizerResultTtlInSeconds: number;
  resourcesPrefix: string;
}

export const create =
  <AccessTokenPayload, RefreshTokenPayload>(
    deps: Dependencies<AccessTokenPayload, RefreshTokenPayload>,
  ) =>
  (props: Props): API.AuthorizersModule => {
    const { jwtModule } = deps;
    const {
      authorizationHeader,
      authorizerResultTtlInSeconds,
      resourcesPrefix,
    } = props;

    const tokenAuthorizerProps = {
      authorizationHeader,
      authorizerResultTtlInSeconds,
      prefix: resourcesPrefix,
    };

    const accessTokenAuthorizer = Implementation.AccessTokenAuthorizer.create({
      jwtModule,
    })(tokenAuthorizerProps);
    const refreshTokenAuthorizer = Implementation.RefreshTokenAuthorizer.create(
      { jwtModule },
    )(tokenAuthorizerProps);

    return {
      accessTokenAuthorizer,
      refreshTokenAuthorizer,
    };
  };
