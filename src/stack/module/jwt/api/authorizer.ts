import { AuthorizationOutcome } from "./authorization-outcome";
import { z } from "zod";

export interface Authorizer<Payload> {
  authorize: (props: {
    token: string;
  }) => Promise<AuthorizationOutcome<Payload>>;
}
