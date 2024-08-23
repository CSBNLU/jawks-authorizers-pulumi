import { API } from "..";
import * as aws from "@pulumi/aws";
import * as Implementation from "../implementation";
import * as pulumi from "@pulumi/pulumi";

export interface Props {
  accessTokenPrivateKeySecretARN: pulumi.Output<string>;
  authorizationHeader?: string;
  authorizerResultTtlInSeconds?: number;
  kidVersionStagePrefix: string;
  kidVersionStagePrefixSeparator: string;
  refreshTokenPrivateKeySecretARN: pulumi.Output<string>;
  region: string;
}

export const create = (props: Props): API.PrivateKeysRepositoriesModule => {
  const {
    accessTokenPrivateKeySecretARN,
    kidVersionStagePrefix,
    kidVersionStagePrefixSeparator,
    refreshTokenPrivateKeySecretARN,
    region,
  } = props;

  const privateKeysRepository =
    Implementation.PrivateKeysRepositoryImplementation.create({
      kidVersionStagePrefix,
      kidVersionStagePrefixSeparator,
      region,
    });

  const accessTokenPrivateKeyRepository =
    Implementation.AccessTokenPrivateKeyRepository.create({
      privateKeysRepository,
    })({ accessTokenPrivateKeySecretARN });

  const refreshTokenPrivateKeyRepository =
    Implementation.RefreshTokenPrivateKeyRepository.create({
      privateKeysRepository,
    })({ refreshTokenPrivateKeySecretARN });

  return {
    accessTokenPrivateKeyRepository,
    refreshTokenPrivateKeyRepository,
  };
};
