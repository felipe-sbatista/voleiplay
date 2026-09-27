import { Router, Request, Response } from 'express';
import { emailServiceClient } from './email-service.client.js';

/**
 * Roteador Proxy/Gateway para a API autônoma de E-mails
 * Redireciona chamadas HTTP REST do Gateway (porta 3000) para o Microsserviço (porta 3004)
 * e expõe métricas do Circuit Breaker.
 */
export function createEmailProxyRouter(): Router {
  const router = Router();
  const targetBaseUrl = emailServiceClient.getBaseUrl();

  // Endpoint para consultar status do Circuit Breaker do cliente de E-mail
  router.get('/circuit-breaker', (req: Request, res: Response) => {
    res.json({
      success: true,
      circuitBreaker: emailServiceClient.getCircuitBreakerStatus()
    });
  });

  // Endpoint para resetar manualmente o Circuit Breaker
  router.post('/circuit-breaker/reset', (req: Request, res: Response) => {
    emailServiceClient.resetCircuitBreaker();
    res.json({
      success: true,
      message: 'Circuit Breaker do serviço de e-mail reiniciado para CLOSED com sucesso.',
      circuitBreaker: emailServiceClient.getCircuitBreakerStatus()
    });
  });

  // Repasse de todas as outras requisições para a API de e-mail remota
  router.all('*', async (req: Request, res: Response) => {
    try {
      const subPath = req.path === '/' ? '' : req.path;
      const query = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';
      const destUrl = `${targetBaseUrl}/api/emails${subPath}${query}`;

      console.log(`\x1b[35m[Gateway Proxy] 🔀 Repassando ${req.method} /services/email${subPath} -> ${destUrl}\x1b[0m`);

      const options: RequestInit = {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
        options.body = JSON.stringify(req.body);
      }

      const response = await fetch(destUrl, options);
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (err: any) {
      console.error(`\x1b[31m[Gateway Proxy] ✖ Falha ao contatar API de E-mail (${targetBaseUrl}):\x1b[0m`, err.message);
      res.status(502).json({
        success: false,
        error: `Falha ao conectar com o microsserviço de e-mail em ${targetBaseUrl}.`,
        hint: 'Inicie a API de e-mail executando: npm run email:dev (ou npm --prefix email-service run dev)',
        details: err.message
      });
    }
  });

  return router;
}
