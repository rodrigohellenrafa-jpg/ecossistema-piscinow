import nodeModule from "node:module";
import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

// Polyfill createRequire for Cloudflare Workers / Nitro runtime where import.meta.url is undefined
try {
  if (nodeModule && typeof nodeModule.createRequire === "function") {
    const origCreateRequire = nodeModule.createRequire;
    nodeModule.createRequire = function (path: unknown) {
      const target = (path || "file:///worker.js") as string | URL;
      return origCreateRequire.call(this, target);
    };
    if (typeof (nodeModule as { syncBuiltinESMExports?: () => void }).syncBuiltinESMExports === "function") {
      (nodeModule as { syncBuiltinESMExports: () => void }).syncBuiltinESMExports();
    }
  }
} catch {
  // Ignore in runtimes where node:module is immutable
}

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  const captured = consumeLastCapturedError();
  const errorObj = captured ?? new Error(`h3 swallowed SSR error: ${body}`);
  console.error(errorObj);
  const errMsg = errorObj instanceof Error ? `${errorObj.message}\n${errorObj.stack || ""}` : String(errorObj);
  return new Response(renderErrorPage(errorObj), {
    status: 500,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "x-ssr-error": encodeURIComponent(errMsg.slice(0, 500)),
    },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    if (env && typeof env === "object") {
      try {
        if (typeof process === "undefined") {
          (globalThis as unknown as { process: { env: Record<string, string> } }).process = { env: {} };
        } else if (!process.env) {
          (process as unknown as { env: Record<string, string> }).env = {};
        }
        for (const [key, val] of Object.entries(env)) {
          if (typeof val === "string" && !process.env[key]) {
            process.env[key] = val;
          }
        }
      } catch {}
    }
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      const errMsg = error instanceof Error ? `${error.message}\n${error.stack || ""}` : String(error);
      return new Response(renderErrorPage(error), {
        status: 500,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "x-ssr-error": encodeURIComponent(errMsg.slice(0, 500)),
        },
      });
    }
  },
};
