import { API } from "../";
import * as jose from "jose";
import * as pulumi from "@pulumi/pulumi";
import { z } from "zod";

export interface Dependencies {
  tokenDefaultClaimsSchemaFactory: () => API.TokenDefaultClaimsSchema;
}

export interface Props<Payload> {
  audience: string;
  issuer: string;
  jwksUri: pulumi.Output<string>;
  payloadSchema?: z.Schema<Payload>;
}

export const create: <Payload>(
  deps: Dependencies,
) => (props: Props<Payload>) => API.Authorizer<Payload> =
  <Payload>(deps: Dependencies) =>
  (props) => {
    const { audience, issuer, jwksUri, payloadSchema } = props;

    return {
      authorize: async ({ token }) => {
        const tokenDefaultClaimsSchema = deps.tokenDefaultClaimsSchemaFactory();

        const JWKS = jose.createRemoteJWKSet(new URL(jwksUri.get()));

        try {
          const { payload, protectedHeader } = await jose.jwtVerify(
            token,
            JWKS,
            {
              issuer,
              audience,
            },
          );

          const defaultClaims = tokenDefaultClaimsSchema.parse(payload);
          const parsedPayload = payloadSchema?.parse(
            payload,
          ) as unknown as Payload;

          return {
            defaultClaims,
            outcome: "granted",
            payload: parsedPayload,
            token,
          };
        } catch (error) {
          return {
            outcome: "denied",
          };
        }
      },
    };
  };
