import {
  APIGatewayAuthorizerEvent,
  APIGatewayRequestAuthorizerEvent,
  APIGatewayAuthorizerResultContext,
  APIGatewayAuthorizerWithContextResult,
} from "aws-lambda";
import { JWT } from "../../module";
import { z } from "zod";

interface Dependencies<Payload> {
  authorizer: JWT.API.Authorizer<Payload>;
}

interface AuthorizationGrantedContext
  extends APIGatewayAuthorizerResultContext {
  defaultClaims: string;
  outcome: "granted";
  payload: string;
}

interface AuthorizationDeniedContext extends APIGatewayAuthorizerResultContext {
  outcome: "denied";
}

type AuthorizationContext =
  | AuthorizationGrantedContext
  | AuthorizationDeniedContext;

function getMethodArn(event: APIGatewayAuthorizerEvent): string {
  if (!event.methodArn) {
    throw new Error('Expected "event.methodArn" parameter to be set');
  }

  const arnPartials = event.methodArn.split("/");
  return arnPartials.slice(0, 2).join("/") + "/*";
}

export const create: <Payload>(
  deps: Dependencies<Payload>,
) => (
  event: APIGatewayRequestAuthorizerEvent,
) => Promise<APIGatewayAuthorizerWithContextResult<AuthorizationContext>> = (
  deps,
) => {
  const { authorizer } = deps;

  return async (event) => {
    const authorizerEventSchema = z.object({
      type: z.literal("TOKEN"),
      authorizationToken: z.string().regex(/^Bearer .+/),
      methodArn: z.string(),
    });

    const parsedEvent = authorizerEventSchema.parse(event);
    const jwt = parsedEvent.authorizationToken.replace(/^Bearer /, "");
    const authorizerOutcome = await authorizer.authorize({ token: jwt });

    if (authorizerOutcome.outcome === "denied") {
      throw new Error("Unauthorized");
    }
    const { defaultClaims, outcome, payload } = authorizerOutcome;

    const methodArn = getMethodArn(event);

    const result: APIGatewayAuthorizerWithContextResult<AuthorizationContext> =
      {
        principalId: defaultClaims.sub,
        policyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Action: "execute-api:Invoke",
              Effect: "Allow",
              Resource: methodArn,
            },
          ],
        },
        context: {
          defaultClaims: JSON.stringify(defaultClaims),
          outcome,
          payload: JSON.stringify(payload),
        },
      };

    return result;
  };
};
