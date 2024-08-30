import { API } from "..";
import * as Implementation from "../implementation";
import * as pulumi from "@pulumi/pulumi";
import { z } from "zod";

interface Dependencies {
  accessTokenPrivateKeyRepository: API.PrivateKeyRepository;
  refreshTokenPrivateKeyRepository: API.PrivateKeyRepository;
}

/**
 * @param props.accessTokenAuthorizer.payloadSchema The schema to validate the access token payload
 * @param props.accessTokenExpiresIn The expiration time of the access token, expressed in seconds or a string describing a time span zeit/ms. Eg: 60, "2 days", "10h", "7d"
 * @param props.audience The audience of the tokens
 * @param props.issuer The issuer of the tokens
 * @param props.jwksFileKey The key of the JWKS file in the S3 bucket
 * @param props.jwksUri The URI of the JWKS file
 * @param props.refreshTokenAuthorizer.payloadSchema The schema to validate the refresh token payload
 * @param props.refreshTokenExpiresIn The expiration time of the refresh token, expressed in seconds or a string describing a time span zeit/ms. Eg: 60, "2 days", "10h", "7d"
 */
interface Props<AccessTokenPayload, RefreshTokenPayload> {
  accessTokenAuthorizer: {
    payloadSchema?: z.Schema<AccessTokenPayload>;
  };
  accessTokenExpiresIn: string | number;
  audience: string;
  issuer: string;
  jwksUri: pulumi.Output<string>;
  refreshTokenAuthorizer: {
    payloadSchema?: z.Schema<RefreshTokenPayload>;
  };
  refreshTokenExpiresIn: string | number;
}

export const create =
  (deps: Dependencies) =>
  <AccessTokenPayload, RefreshTokenPayload>(
    props: Props<AccessTokenPayload, RefreshTokenPayload>,
  ): API.JWTModule<AccessTokenPayload, RefreshTokenPayload> => {
    const {
      accessTokenPrivateKeyRepository,
      refreshTokenPrivateKeyRepository,
    } = deps;
    const {
      accessTokenAuthorizer,
      accessTokenExpiresIn,
      audience,
      issuer,
      jwksUri,
      refreshTokenAuthorizer,
      refreshTokenExpiresIn,
    } = props;

    const tokenDefaultClaimsSchemaFactory = () =>
      Implementation.tokenDefaultClaimsSchema.create({ audience, issuer });
    return {
      accessTokenAuthorizer:
        Implementation.tokenAuthorizer.create<AccessTokenPayload>({
          tokenDefaultClaimsSchemaFactory,
        })({
          audience,
          issuer,
          jwksUri,
          payloadSchema: accessTokenAuthorizer.payloadSchema,
        }),
      accessTokenFactory:
        Implementation.tokenFactory.create<AccessTokenPayload>({
          privateKeysRepository: accessTokenPrivateKeyRepository,
        })({ audience, expiresIn: accessTokenExpiresIn, issuer }),
      refreshTokenAuthorizer:
        Implementation.tokenAuthorizer.create<RefreshTokenPayload>({
          tokenDefaultClaimsSchemaFactory,
        })({
          audience,
          issuer,
          jwksUri,
          payloadSchema: refreshTokenAuthorizer.payloadSchema,
        }),
      refreshTokenFactory:
        Implementation.tokenFactory.create<RefreshTokenPayload>({
          privateKeysRepository: refreshTokenPrivateKeyRepository,
        })({ audience, expiresIn: refreshTokenExpiresIn, issuer }),
      tokenDefaultClaimsSchemaFactory,
    };
  };
