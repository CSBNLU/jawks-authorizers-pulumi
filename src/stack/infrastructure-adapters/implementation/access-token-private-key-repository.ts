import { API } from "../";
import { JWT } from "../../module";
import * as pulumi from "@pulumi/pulumi";

export interface Dependencies {
  privateKeysRepository: API.PrivateKeysRepository;
}

export interface Props {
  accessTokenPrivateKeySecretARN: pulumi.Output<string>;
}

export const create: (
  deps: Dependencies,
) => (props: Props) => JWT.API.PrivateKeyRepository = (deps) => (props) => {
  const { privateKeysRepository } = deps;
  const { accessTokenPrivateKeySecretARN } = props;
  return {
    retrievePrivateKey: () => {
      return privateKeysRepository.retrievePrivateKey({
        secretARN: accessTokenPrivateKeySecretARN.get(),
      });
    },
  };
};
