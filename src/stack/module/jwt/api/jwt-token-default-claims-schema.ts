import { z } from "zod";

export type TokenDefaultClaimsSchema = z.Schema<{
  exp: number;
  iss: string;
  sub: string;
  aud: string | string[];
}>;
