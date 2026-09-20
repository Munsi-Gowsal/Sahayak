import { NextRequest } from "next/server";
import { invokeLambda } from "../../../../../lib/lambdaWrapper";
import { handler } from "../../../../../../../../services/api/src/handlers/updateEmergencyStatus";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return invokeLambda(req, handler, resolvedParams);
}
