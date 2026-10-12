import { NextRequest, NextResponse } from "next/server";

const rawBackendUrl = process.env.BACKEND_INTERNAL_URL || "https://api.lankacare.me";
const BACKEND_URL = rawBackendUrl.replace(/\/+$/, "");

async function handleProxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const path = resolvedParams.path ? resolvedParams.path.join("/") : "";
  const search = req.nextUrl.search || "";
  const targetUrl = `${BACKEND_URL}/api/${path}${search}`;

  const forwardHeaders = new Headers();
  req.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    // Exclude hop-by-hop headers and original host
    if (!["host", "connection", "content-length"].includes(lowerKey)) {
      forwardHeaders.set(key, value);
    }
  });

  // Ensure origin is set to authorized production domain to prevent Azure CORS 403 rejections
  forwardHeaders.set("Origin", "https://www.lankacare.me");
  forwardHeaders.set("Referer", "https://www.lankacare.me/");

  const method = req.method.toUpperCase();
  const init: RequestInit = {
    method,
    headers: forwardHeaders,
    redirect: "manual",
  };

  if (!["GET", "HEAD"].includes(method)) {
    try {
      const bodyBlob = await req.blob();
      if (bodyBlob.size > 0) {
        init.body = bodyBlob;
      }
    } catch {
      // Body already read or empty
    }
  }

  try {
    const backendRes = await fetch(targetUrl, init);

    const responseHeaders = new Headers();
    backendRes.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      // Forward all response headers except hop-by-hop
      if (!["content-encoding", "transfer-encoding", "connection"].includes(lowerKey)) {
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
    return NextResponse.json(
      {
        error: `Backend gateway unavailable: ${error?.message || "Failed to connect to healthcare backend"}`,
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
