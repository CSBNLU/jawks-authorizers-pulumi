import { API } from "../";
import { SecretsManager } from "@aws-sdk/client-secrets-manager";
import { z } from "zod";

export interface Props {
  kidVersionStagePrefix: string;
  kidVersionStagePrefixSeparator: string;
  region: string;
}

export const create: (props: Props) => API.PrivateKeysRepository = (
  props: Props,
) => {
  const { kidVersionStagePrefix, kidVersionStagePrefixSeparator, region } =
    props;
  const secretsManager = new SecretsManager({ region });

  const versionStagePrefix = `${kidVersionStagePrefix}${kidVersionStagePrefixSeparator}`;

  const secretSchema = z.object({
    versionStage: z
      .array(z.string())
      .transform((val) =>
        val.find((versionStage) => versionStage.startsWith(versionStagePrefix)),
      )
      .refine((val) => val !== undefined),
    secret: z.string(),
  });

  return {
    retrievePrivateKey: async (props) => {
      const { secretARN } = props;
      const secretManagerValue = await secretsManager.getSecretValue({
        SecretId: secretARN,
      });
      const { secret, versionStage } = secretSchema.parse({
        secret: secretManagerValue.SecretString,
        versionStage: secretManagerValue.VersionStages,
      });

      const kid = versionStage.replace(versionStagePrefix, "");
      return { key: secret, kid };
    },
  };
};
