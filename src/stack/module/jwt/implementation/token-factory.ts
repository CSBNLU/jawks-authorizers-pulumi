import { API } from "../";
import * as jwt from "jsonwebtoken";

export interface Dependencies {
  privateKeysRepository: API.PrivateKeyRepository;
}

/**
 * @param TokenPayload: The type of the payload to be included in the token
 * @param Props: The properties required to generate a token
 * @param Props.audience: The audience of the token
 * @param Props.expiresIn: The expiration time of the token, expressed in seconds or a string describing a time span zeit/ms. Eg: 60, "2 days", "10h", "7d"
 * @param Props.issuer: The issuer of the token
 */
export interface Props {
  audience: string;
  expiresIn: string | number;
  issuer: string;
}

export const create =
  <TokenPayload>(deps: Dependencies) =>
  (props: Props): API.TokenFactory<TokenPayload> => {
    const { privateKeysRepository } = deps;
    const { audience, expiresIn, issuer } = props;

    return {
      generateToken: async ({ payload, sub }) => {
        const signingKey = await privateKeysRepository.retrievePrivateKey();
        const token = jwt.sign({ payload }, signingKey.key, {
          algorithm: "ES512",
          audience,
          expiresIn,
          issuer,
          keyid: signingKey.kid,
          subject: sub,
        });
        const { exp } = jwt.decode(token) as { exp: number };
        const expDate = new Date(exp * 1000);
        return { exp: expDate, token };
      },
    };
  };
