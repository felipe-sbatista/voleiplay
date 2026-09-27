import { Router, Request, Response } from 'express';
import { Observability } from './apm.js';

export function createObservabilityRouter(): Router {
  const router = Router();

  /**
   * Status geral e orientações de Observabilidade
   */
  router.get('/status', (req: Request, res: Response) => {
    const isStarted = Observability.agent.isStarted();
    res.json({
      status: 'success',
      agent: {
        active: isStarted,
        serviceName: process.env.ELASTIC_APM_SERVICE_NAME || 'voleiplay-backend',
        serverUrl: process.env.ELASTIC_APM_SERVER_URL || 'http://localhost:8200',
        environment: process.env.NODE_ENV || 'development',
      },
      kibanaUrl: 'http://localhost:5601/app/apm',
      educationalTopics: [
        'Distributed Tracing (Saga e Microsserviços)',
        'Waterfall de Spans e Detecção de Gargalos',
        'Métricas RED (Rate, Errors, Duration)',
        'Métricas de Infraestrutura (CPU, Memória, Event Loop)',
        'Captura Estruturada de Erros e Stack Traces'
      ]
    });
  });

  /**
   * Laboratório 1: Detecção de Gargalos com Spans Customizados
   * Demonstra como o Kibana APM exibe a linha do tempo (Waterfall) detalhando
   * onde cada milissegundo foi gasto na transação.
   */
  router.get('/slow-operation', async (req: Request, res: Response) => {
    Observability.setLabel('simulationType', 'bottleneck-investigation');
    Observability.setLabel('ticketCategory', 'VIP-Final-Superliga');
    Observability.setUser('student-01', 'aluno_lab', 'aluno@voleiplay.edu');

    // Span 1: Leitura rápida do repositório/cache (50ms)
    const cacheSpan = Observability.startSpan('Verificar Cache Redis', 'cache', 'redis', 'get');
    await new Promise(resolve => setTimeout(resolve, 50));
    cacheSpan?.end();

    // Span 2: Consulta pesada de banco de dados (Gargalo 1: 350ms)
    const dbSpan = Observability.startSpan('Consultar Histórico no Postgres', 'db', 'postgresql', 'query');
    await new Promise(resolve => setTimeout(resolve, 350));
    dbSpan?.end();

    // Span 3: Chamada a serviço externo de gateway de pagamento (Gargalo 2: 450ms)
    const paymentSpan = Observability.startSpan('Autorização Gateway Pagamentos', 'external', 'http', 'post');
    await new Promise(resolve => setTimeout(resolve, 450));
    paymentSpan?.end();

    // Span 4: Processamento de CPU (algoritmo de criptografia do bilhete: 100ms)
    const cpuSpan = Observability.startSpan('Geração de QR-Code Criptografado', 'app', 'crypto', 'generate');
    const start = Date.now();
    while (Date.now() - start < 100) {
      // Pequeno busy-wait controlado para simular trabalho de CPU
      Math.sqrt(Math.random());
    }
    cpuSpan?.end();

    res.json({
      success: true,
      message: 'Operação simulada finalizada com sucesso!',
      analysis: 'Abra o Kibana APM na transação GET /observability/slow-operation para inspecionar os 4 spans e identificar os gargalos de I/O e CPU.',
      spansExecuted: [
        { name: 'Verificar Cache Redis', duration: '~50ms', type: 'cache.redis' },
        { name: 'Consultar Histórico no Postgres', duration: '~350ms', type: 'db.postgresql (Gargalo I/O)' },
        { name: 'Autorização Gateway Pagamentos', duration: '~450ms', type: 'external.http (Gargalo Rede)' },
        { name: 'Geração de QR-Code Criptografado', duration: '~100ms', type: 'app.crypto (CPU)' }
      ],
      totalApproximateDuration: '~950ms'
    });
  });

  /**
   * Laboratório 2: Rastreamento de Erros e Stack Traces com Contexto Rico
   * Demonstra como o APM captura exceções, preserva os parâmetros da requisição
   * e correlaciona o erro exatamente à transação que falhou.
   */
  router.get('/error-simulation', (req: Request, res: Response) => {
    const ticketId = req.query.ticketId as string || 'TKT-ERROR-999';
    const matchId = req.query.matchId as string || 'MATCH-BRASIL-ITALIA';

    Observability.setLabel('ticketId', ticketId);
    Observability.setLabel('matchId', matchId);
    Observability.setCustomContext({
      arena: 'Ginásio do Maracanãzinho',
      attempt: 3,
      seatSelected: 'Setor A - Cadeira 42'
    });

    try {
      // Simulação de erro de negócio inesperado
      throw new Error(`[SIMULAÇÃO DIDÁTICA] Falha de concorrência: O assento 42 da partida ${matchId} acabou de ser vendido em outra transação concorrente.`);
    } catch (err: any) {
      // Registra o erro no APM com stack trace enriquecido
      Observability.captureError(err, {
        failureReason: 'SeatAlreadyReservedException',
        ticketId
      });

      res.status(500).json({
        success: false,
        error: err.message,
        didacticNote: 'Este erro e sua stack trace foram capturados e enviados ao APM Server. Acesse a aba "Errors" no Kibana para visualizar o agrupamento de falhas e o impacto em tempo real.'
      });
    }
  });

  /**
   * Laboratório 3: Estresse de Event Loop e Alocação de Memória
   * Demonstra métricas de NodeJS Runtime (Event Loop Delay, Heap Used, CPU Usage).
   */
  router.get('/metrics-load', async (req: Request, res: Response) => {
    Observability.setLabel('stressType', 'event-loop-pressure');

    // Executa blocos de trabalho para movimentar métricas
    const bigArray: string[] = [];
    const span = Observability.startSpan('Carga de Alocação e Loop', 'simulation', 'stress');

    for (let i = 0; i < 50000; i++) {
      bigArray.push(`token-telemetria-aluno-${i}-${Date.now()}`);
    }

    // Aguarda 100ms para permitir ciclo do event loop registrar delay
    await new Promise(resolve => setTimeout(resolve, 150));
    span?.end();

    res.json({
      success: true,
      itemsAllocated: bigArray.length,
      message: 'Carga gerada! Acesse a aba "Metrics" no Kibana APM para visualizar as variações de Event Loop Delay, Heap Memory e CPU.'
    });
  });

  return router;
}
