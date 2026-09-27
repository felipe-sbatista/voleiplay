import { Router, Request, Response } from 'express';

/**
 * Roteador Proxy/Gateway para a API autônoma de Autenticação
 * Redireciona chamadas HTTP REST do Gateway (porta 3000) para o Auth Microservice (porta 3007)
 */
export function createAuthProxyRouter(): Router {
  const router = Router();
  const targetBaseUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3007';

  router.all('*', async (req: Request, res: Response) => {
    try {
      const subPath = req.path === '/' ? '' : req.path;
      const query = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';
      const destUrl = `${targetBaseUrl}/api/auth${subPath}${query}`;

      console.log(`\x1b[35m[Gateway Proxy] 🔀 Repassando ${req.method} /services/auth${subPath} -> ${destUrl}\x1b[0m`);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      if (req.headers.authorization) {
        headers['Authorization'] = req.headers.authorization;
      }

      const options: RequestInit = {
        method: req.method,
        headers
      };

      if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
        options.body = JSON.stringify(req.body);
      }

      const response = await fetch(destUrl, options);
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (err: any) {
      console.error(`\x1b[31m[Gateway Proxy] ✖ Falha ao contatar Auth Service (${targetBaseUrl}):\x1b[0m`, err.message);
      res.status(502).json({
        success: false,
        error: `Falha ao conectar com o microsserviço de autenticação em ${targetBaseUrl}.`,
        hint: 'Inicie o serviço executando: npm run auth:dev (ou npm --prefix auth-service run dev)',
        details: err.message
      });
    }
  });

  return router;
}
