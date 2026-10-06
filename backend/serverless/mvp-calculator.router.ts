import { Router, Request, Response } from 'express';
import { processMatchStats } from './calculator.js';
import { MatchInput } from './types.js';

export function createMvpCalculatorRouter(): Router {
  const router = Router();

  /**
   * Endpoint de Metadados e Documentação da Function
   */
  router.get('/', (req: Request, res: Response) => {
    res.json({
      service: 'voleiplay-mvp-calculator-function',
      type: 'Serverless Edge / FaaS Function',
      platform: 'Railway + Cloudflare Workers Compatible',
      status: 'UP',
      architecture: 'Stateless / Ephemeral Compute',
      endpoints: {
        'POST /serverless/mvp-calculator/calculate': 'Envia scout completo da partida e recebe o MVP eleito e estatísticas técnicas',
        'GET /serverless/mvp-calculator': 'Metadados e documentação didática'
      },
      formulaExplanation: {
        attackEfficiency: '((Kills - Erros de Ataque) / Total de Ataques) * 100',
        mvpScore: '(Aces * 3) + (Blocks * 3) + (Kills * 2) + (Digs * 1.5) - (Erros * 2)'
      }
    });
  });

  router.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'UP', service: 'mvp-calculator-function' });
  });

  /**
   * Endpoint de Execução da Function
   */
  const handleCalculate = (req: Request, res: Response) => {
    const startTime = performance.now();
    try {
      const body: MatchInput = req.body;

      if (!body.teams || !Array.isArray(body.teams) || body.teams.length < 2) {
        return res.status(400).json({
          error: 'Payload inválido: a partida deve conter pelo menos 2 times com jogadores e estatísticas.'
        });
      }

      const report = processMatchStats(body, startTime);

      res.setHeader('X-Serverless-Engine', 'Railway-FaaS-Adapter');
      res.setHeader('Server-Timing', `compute;dur=${report.executionTimeMs}`);
      return res.json(report);
    } catch (err: any) {
      return res.status(500).json({
        error: 'Erro no processamento da função serverless',
        details: err.message
      });
    }
  };

  router.post('/calculate', handleCalculate);
  router.post('/', handleCalculate);

  return router;
}
