import { cookies } from "next/headers";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

export const AUTH_COOKIES = {
  access: "smis_access",
  id: "smis_id",
  state: "smis_oauth_state",
  verifier: "smis_pkce_verifier",
} as const;

export interface AuthConfig {
  baseUrl?: string;
  clientId: string;
  domain: string;
  issuer: string;
  region: string;
  userPoolId: string;
}

export interface Session {
  sub: string;
  email?: string;
  name?: string;
  schoolId?: string;
  personId?: string;
  groups: string[];
  primaryRole: "platform_admin" | "school_admin" | "teacher" | "student" | "parent_guardian" | "finance_officer" | "user";
}

let remoteKeys: ReturnType<typeof createRemoteJWKSet> | undefined;
let remoteIssuer = "";

export function getAuthConfig(): AuthConfig | null {
  const clientId = process.env.COGNITO_CLIENT_ID;
  const domain = process.env.COGNITO_DOMAIN?.replace(/\/$/, "");
  const region = process.env.COGNITO_REGION;
  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  if (!clientId || !domain || !region || !userPoolId) return null;
  return {
    baseUrl: process.env.AUTH_BASE_URL?.replace(/\/$/, ""),
    clientId,
    domain,
    region,
    userPoolId,
    issuer: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
  };
}

export function authBaseUrl(requestOrigin: string): string {
  return getAuthConfig()?.baseUrl ?? requestOrigin;
}

export function authCookieOptions(baseUrl: string, maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: baseUrl.startsWith("https://"),
    path: "/",
    maxAge,
  };
}

export async function verifyIdToken(token: string, config: AuthConfig): Promise<JWTPayload> {
  if (!remoteKeys || remoteIssuer !== config.issuer) {
    remoteIssuer = config.issuer;
    remoteKeys = createRemoteJWKSet(new URL(`${config.issuer}/.well-known/jwks.json`));
  }
  const { payload } = await jwtVerify(token, remoteKeys, {
    issuer: config.issuer,
    audience: config.clientId,
  });
  if (payload.token_use !== "id") throw new Error("Unexpected Cognito token use");
  return payload;
}

function groupsFrom(payload: JWTPayload): string[] {
  const value = payload["cognito:groups"];
  if (Array.isArray(value)) return value.filter((group): group is string => typeof group === "string");
  if (typeof value === "string") return value.split(/[ ,]+/).filter(Boolean);
  return [];
}

function primaryRole(groups: string[]): Session["primaryRole"] {
  if (groups.includes("PlatformAdmin")) return "platform_admin";
  if (groups.includes("SchoolAdmin")) return "school_admin";
  if (groups.includes("FinanceOfficer")) return "finance_officer";
  if (groups.includes("Teacher")) return "teacher";
  if (groups.includes("ParentGuardian")) return "parent_guardian";
  if (groups.includes("Student")) return "student";
  return "user";
}

export async function getSession(): Promise<Session | null> {
  const config = getAuthConfig();
  if (!config) return null;
  const token = (await cookies()).get(AUTH_COOKIES.id)?.value;
  if (!token) return null;
  try {
    const payload = await verifyIdToken(token, config);
    if (!payload.sub) return null;
    const groups = groupsFrom(payload);
    return {
      sub: payload.sub,
      email: typeof payload.email === "string" ? payload.email : undefined,
      name: typeof payload.name === "string" ? payload.name : undefined,
      schoolId: typeof payload["custom:school_id"] === "string" ? payload["custom:school_id"] : undefined,
      personId: typeof payload["custom:person_id"] === "string" ? payload["custom:person_id"] : undefined,
      groups,
      primaryRole: primaryRole(groups),
    };
  } catch {
    return null;
  }
}
