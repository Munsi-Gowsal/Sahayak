import { NextRequest, NextResponse } from "next/server";

export async function invokeLambda(
  req: NextRequest, 
  handler: (event: any) => Promise<any>, 
  params?: Record<string, string>
) {
  try {
    const url = new URL(req.url);
    const queryStringParameters = Object.fromEntries(url.searchParams.entries());
    
    // Attempt to parse body for POST/PUT
    let body = null;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      try {
        const json = await req.json();
        body = JSON.stringify(json);
      } catch (e) {
        // Body might be empty
      }
    }

    // Pass headers
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    const event = {
      httpMethod: req.method,
      path: url.pathname,
      queryStringParameters,
      pathParameters: params || {},
      headers,
      body,
      requestContext: {
        authorizer: {
          claims: {
            "cognito:groups": headers['x-mock-role'] ? [headers['x-mock-role']] : ["CITIZEN"]
          }
        }
      }
    };

    const response = await handler(event);

    return new NextResponse(response.body, {
      status: response.statusCode,
      headers: response.headers || { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("Lambda wrapper error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
