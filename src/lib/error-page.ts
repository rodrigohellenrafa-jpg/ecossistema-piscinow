export function renderErrorPage(error?: unknown): string {
  const details = error
    ? error instanceof Error
      ? `${error.name}: ${error.message}\n${error.stack || ""}`
      : String(error)
    : "";
  const safeDetails = details
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>Piscinow ERP — Carregando</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #ffffff; color: #111; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 34rem; width: 100%; text-align: center; padding: 2rem; border: 1px solid #e5e7eb; border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; color: #111; }
      p { color: #4b5563; margin: 0 0 1.5rem; font-size: 0.9375rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; margin-bottom: 1rem; }
      a, button { padding: 0.5rem 1.25rem; border-radius: 0.375rem; font: inherit; font-size: 0.875rem; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #0ea5e9; color: #fff; font-weight: 500; }
      .secondary { background: #fff; color: #111; border-color: #d1d5db; }
      pre { text-align: left; background: #f3f4f6; padding: 0.75rem; font-size: 11px; overflow-x: auto; border-radius: 4px; white-space: pre-wrap; word-break: break-all; color: #dc2626; margin-top: 1rem; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Carregando Piscinow ERP</h1>
      <p>Ocorreu uma instabilidade na renderização do servidor. Clique abaixo para tentar novamente ou acessar diretamente.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Tentar novamente</button>
        <a class="secondary" href="/auth">Ir para login</a>
      </div>
      ${safeDetails ? `<pre>${safeDetails}</pre>` : ""}
    </div>
  </body>
</html>`;
}
