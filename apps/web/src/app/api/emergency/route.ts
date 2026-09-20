import { NextRequest } from "next/server";
import { invokeLambda } from "../../../lib/lambdaWrapper";
import { handler } from "../../../../../../services/api/src/handlers/createEmergency";

export async function POST(req: NextRequest) {
  return invokeLambda(req, handler);
}
