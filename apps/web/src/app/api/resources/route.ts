import { NextRequest } from "next/server";
import { invokeLambda } from "../../../lib/lambdaWrapper";
import { handler as getResourcesHandler } from "../../../../../../services/api/src/handlers/getResources";
import { handler as createResourceHandler } from "../../../../../../services/api/src/handlers/createResource";

export async function GET(req: NextRequest) {
  return invokeLambda(req, getResourcesHandler);
}

export async function POST(req: NextRequest) {
  return invokeLambda(req, createResourceHandler);
}
