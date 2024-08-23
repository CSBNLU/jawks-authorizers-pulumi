import * as aws from '@pulumi/aws';
import * as InfrastructureAdapters from './infrastructure-adapters';
import { JWT } from './module';
import * as pulumi from '@pulumi/pulumi';
import { z } from 'zod';

export interface Configuration<AccessTokenPayload, RefreshTokenPayload> {
	accessTokenExpiresIn: string | number
	accessTokenPayloadSchema?: z.Schema<AccessTokenPayload>;
	accessTokenPrivateKeySecretARN: pulumi.Output<string>;
	audience: string;
	authorizationHeader?: string;
	authorizerResultTtlInSeconds?: number;
	issuer: string;
	jwksUri: pulumi.Output<string>;
	kidVersionStagePrefix: string;
	kidVersionStagePrefixSeparator: string;
	refreshTokenExpiresIn: string | number;
	refreshTokenPayloadSchema?: z.Schema<RefreshTokenPayload>;
	refreshTokenPrivateKeySecretARN: pulumi.Output<string>;
	region: string;
	resourcesPrefix: string;
}

export const compose = <AccessTokenPayload, RefreshTokenPayload>(configuration: Configuration<AccessTokenPayload, RefreshTokenPayload>) => {
	const { accessTokenExpiresIn, accessTokenPayloadSchema, accessTokenPrivateKeySecretARN, audience, issuer, jwksUri, kidVersionStagePrefix, kidVersionStagePrefixSeparator, refreshTokenExpiresIn, refreshTokenPayloadSchema, refreshTokenPrivateKeySecretARN, region, resourcesPrefix } = configuration;


	const authorizationHeader = configuration.authorizationHeader ?? 'Authorization';
	const authorizerResultTtlInSeconds = configuration.authorizerResultTtlInSeconds ?? 300;

	const {
		accessTokenPrivateKeyRepository,
		refreshTokenPrivateKeyRepository
	} = InfrastructureAdapters.Bindings.PrivateKeysRepositories.create({
		accessTokenPrivateKeySecretARN,
		kidVersionStagePrefix,
		kidVersionStagePrefixSeparator,
		region,
		refreshTokenPrivateKeySecretARN
	});

	const jwtModuleProps = {
		accessTokenAuthorizer: {
			payloadSchema: accessTokenPayloadSchema
		},
		accessTokenExpiresIn,
		audience,
		issuer,
		jwksUri,
		refreshTokenAuthorizer: {
			payloadSchema: refreshTokenPayloadSchema
		},
		refreshTokenExpiresIn,
	}

	const jwtModule: JWT.API.JWTModule<AccessTokenPayload, RefreshTokenPayload> = JWT.Bindings.create({
		accessTokenPrivateKeyRepository,
		refreshTokenPrivateKeyRepository,
	})(jwtModuleProps);

	const infrastructureAdaptersDeps = {
		jwtModule
	}
	const infrastructureAdaptersProps = {
		authorizationHeader,
		authorizerResultTtlInSeconds,
		resourcesPrefix,
	}

	const {
		accessTokenAuthorizer,
		refreshTokenAuthorizer,
	} = InfrastructureAdapters.Bindings.Authorizers.create(infrastructureAdaptersDeps)(infrastructureAdaptersProps);

	return {
		accessTokenAuthorizer,
		accessTokenPrivateKeyRepository,
		refreshTokenAuthorizer,
		refreshTokenPrivateKeyRepository
	}
}
