interface DefaultClaims {
  aud: string | string[];
  exp: number;
  iss: string;
  sub: string;
}

export interface AuthorizationGrantedOutcome<Payload> {
  defaultClaims: DefaultClaims;
  outcome: "granted";
  payload: Payload;
}

export interface AuthorizationDeniedOutcome {
  outcome: "denied";
}

export type AuthorizationOutcome<Payload> =
  | AuthorizationGrantedOutcome<Payload>
  | AuthorizationDeniedOutcome;
