export interface DefaultClaims {
  aud: string | string[];
  exp: number;
  iss: string;
  sub: string;
}

export interface AuthorizationGrantedOutcome<Payload> {
  defaultClaims: DefaultClaims;
  outcome: "granted";
  payload: Payload;
  token: string;
}

export interface AuthorizationDeniedOutcome {
  outcome: "denied";
}

export type AuthorizationOutcome<Payload> =
  | AuthorizationGrantedOutcome<Payload>
  | AuthorizationDeniedOutcome;
