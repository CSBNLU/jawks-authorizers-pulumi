import { API } from "../";
import * as jose from "jose";
import * as pulumi from "@pulumi/pulumi";
import { z } from "zod";

export interface Dependencies {}

export interface Props<Payload> {
  audience: string;
  issuer: string;
  jwksUri: pulumi.Output<string>;
  payloadSchema?: z.Schema<Payload>;
}

export const create: <Payload>(
  deps: Dependencies,
) => (props: Props<Payload>) => API.Authorizer<Payload> =
  <Payload>() =>
  (props) => {
    const { audience, issuer, jwksUri, payloadSchema } = props;

    return {
      authorize: async ({ token }) => {
        const tokenDefaultClaimsSchema = API.JWTTokenDefaultClaimsSchema.create(
          { audience, issuer },
        );

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
          };
        } catch (error) {
          return {
            outcome: "denied",
          };
        }
      },
    };
  };
