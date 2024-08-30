import { API } from "..";
import { z } from "zod";

export const create = (props: {
  audience: string;
  issuer: string;
}): API.TokenDefaultClaimsSchema =>
  z.object({
    exp: z.number(),
    iss: z.literal(props.issuer),
    sub: z.string(),
    aud: z
      .literal(props.audience)
      .or(z.array(z.string()).refine((val) => val.includes(props.audience))),
  });
