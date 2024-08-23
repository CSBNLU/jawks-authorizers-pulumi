import * as aws from "@pulumi/aws";
import { JWT } from '../../module'
import { AuthorizerArgs } from "@pulumi/aws-apigateway/types/input";
import * as lambdaAuthorizer from './lambda-authorizer';

export interface Dependencies<AccessTokenPayload, RefreshTokenPayload> {
	jwtModule: JWT.API.JWTModule<AccessTokenPayload, RefreshTokenPayload>;
}

export interface Props {
	authorizationHeader: string;
	authorizerResultTtlInSeconds: number;
	prefix: string;
}

export const create: <AccessTokenPayload, RefreshTokenPayload>(deps: Dependencies<AccessTokenPayload, RefreshTokenPayload>) => (props: Props) => AuthorizerArgs = (deps) => (props) => ({
	authType: "custom",
	authorizerName: `${props.prefix}-access-token-authorizer`,
	parameterName: props.authorizationHeader,
	type: "token",
	parameterLocation: "header",
	authorizerResultTtlInSeconds: props.authorizerResultTtlInSeconds,
	handler: new aws.lambda.CallbackFunction(`${props.prefix}-access-token-authorizer`, {
		architectures: ["arm64"],
		callback: lambdaAuthorizer.create({ authorizer: deps.jwtModule.accessTokenAuthorizer }),
	}),
});
