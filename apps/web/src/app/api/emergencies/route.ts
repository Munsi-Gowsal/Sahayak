import { NextRequest } from "next/server";
import { invokeLambda } from "../../../lib/lambdaWrapper";
import { handler } from "../../../../../../services/api/src/handlers/getEmergencies";

export async function GET(req: NextRequest) {
  return invokeLambda(req, handler);
}
