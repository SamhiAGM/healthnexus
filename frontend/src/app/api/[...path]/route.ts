import { NextRequest, NextResponse } from "next/server";

const rawBackendUrl = process.env.BACKEND_INTERNAL_URL || "https://api.lankacare.me";
const BACKEND_URL = rawBackendUrl.replace(/\/+$/, "");

async function handleProxy(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await context.params;
  const pathSegments = resolvedParams.path || [];
  const path = pathSegments.join("/");
  const search = req.nextUrl.search || "";
  const targetUrl = `${BACKEND_URL}/api/${path}${search}`;

  const forwardHeaders: Record<string, string> = {
    "Accept": req.headers.get("accept") || "application/json",
    "Origin": "https://www.lankacare.me",
    "Referer": "https://www.lankacare.me/",
  };

  const contentType = req.headers.get("content-type");
  if (contentType) {
    forwardHeaders["Content-Type"] = contentType;
  }

  const cookie = req.headers.get("cookie");
  if (cookie) {
    forwardHeaders["Cookie"] = cookie;
  }

  const auth = req.headers.get("authorization");
  if (auth) {
    forwardHeaders["Authorization"] = auth;
  }

  const xsrf = req.headers.get("x-xsrf-token");
  if (xsrf) {
    forwardHeaders["X-XSRF-TOKEN"] = xsrf;
  }

  const method = req.method.toUpperCase();
  const init: RequestInit = {
    method,
    headers: forwardHeaders,
    redirect: "manual",
  };

  if (!["GET", "HEAD"].includes(method)) {
    try {
      const textBody = await req.text();
      if (textBody && textBody.length > 0) {
        init.body = textBody;
      }
    } catch {
      // Body empty or already consumed
    }
  }

  try {
    const backendRes = await fetch(targetUrl, init);

    const responseHeaders = new Headers();
    backendRes.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (!["content-encoding", "transfer-encoding", "connection"].includes(lower)) {
        responseHeaders.append(key, value);
      }
    });

    const bodyBuffer = await backendRes.arrayBuffer();

    return new NextResponse(bodyBuffer, {
      status: backendRes.status,
      statusText: backendRes.statusText,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("API Proxy Gateway error to", targetUrl, error);
    return NextResponse.json(
      {
        error: `Backend gateway unavailable: ${error?.message || "Failed to connect to backend"}`,
      },
      { status: 502 }
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
export const OPTIONS = handleProxy;
