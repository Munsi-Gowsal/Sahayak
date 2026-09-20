export type UserRole = "CITIZEN" | "OPERATOR" | "RESPONDER";

/**
 * Extracts the user role from the API Gateway event.
 * In a real AWS environment with a Cognito Authorizer, the groups are found in:
 * event.requestContext.authorizer.claims['cognito:groups']
 * 
 * For local testing/MVP, we fall back to a custom header if the authorizer context is missing.
 */
export function getUserRole(event: any): UserRole {
  // 1. Check API Gateway Cognito Authorizer claims
  const claims = event.requestContext?.authorizer?.claims;
  if (claims && claims["cognito:groups"]) {
    const groups = claims["cognito:groups"];
    if (groups.includes("OPERATOR")) return "OPERATOR";
    if (groups.includes("RESPONDER")) return "RESPONDER";
    return "CITIZEN";
  }

  // 2. Fallback for local testing (mocked authentication)
  const roleHeader = event.headers?.['x-mock-role'] || event.headers?.['X-Mock-Role'];
  if (roleHeader === "OPERATOR") return "OPERATOR";
  if (roleHeader === "RESPONDER") return "RESPONDER";
  
  // Default to CITIZEN if no role is explicitly provided
  return "CITIZEN";
}

export function requireRole(event: any, allowedRoles: UserRole[]) {
  const role = getUserRole(event);
  if (!allowedRoles.includes(role)) {
    throw new Error(`Forbidden: Requires one of [${allowedRoles.join(", ")}], but user is ${role}`);
  }
  return role;
}
