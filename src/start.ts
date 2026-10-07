import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
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
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [errorMiddleware],
}));
