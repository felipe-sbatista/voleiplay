import { processMatchStats } from './calculator.js';
import { MatchInput } from './types.js';

/**
 * Cloudflare Worker / Edge Serverless Entry Point
 * Padrão Moderno Web Standards: FetchEvent handler com Request -> Response
 */
export default {
  async fetch(request: Request, env?: any, ctx?: any): Promise<Response> {
    const startTime = performance.now();
    const url = new URL(request.url);

    // Configuração de cabeçalhos CORS para permitir chamadas do frontend Angular
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json'
    };

    // Responde ao preflight OPTIONS do navegador
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders, status: 204 });
    }

    // Endpoint informativo GET: Documentação e metadados da Serverless Function
    if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/health')) {
      return new Response(
        JSON.stringify({
          service: 'voleiplay-mvp-calculator-function',
          type: 'Serverless Edge Function (FaaS)',
          compatibleWith: ['Cloudflare Workers', 'Vercel Functions', 'AWS Lambda'],
          status: 'UP',
          architecture: 'Stateless / Ephemeral Compute',
          endpoints: {
            'POST /calculate': 'Envia scout completo de partida e recebe estatísticas calculadas + eleição do MVP',
            'GET /health': 'Retorna saúde e metadados'
          },
          formulaExplanation: {
            attackEfficiency: '((Ataques - Erros) / Total de Ataques) * 100',
            mvpScore: '(Aces * 3) + (Bloqueios * 3) + (Ataques * 2) + (Defesas * 1.5) - (Erros * 2)'
          }
        }, null, 2),
        { headers: corsHeaders, status: 200 }
      );
    }

    // Endpoint POST /calculate: Execução da lógica de negócio
    if (request.method === 'POST') {
      try {
        const body: MatchInput = await request.json();

        // Validação defensiva do payload de entrada
        if (!body.teams || !Array.isArray(body.teams) || body.teams.length < 2) {
          return new Response(
            JSON.stringify({
              error: 'Payload inválido: a partida deve conter pelo menos 2 times com jogadores e estatísticas.'
            }),
            { headers: corsHeaders, status: 400 }
          );
        }

        const report = processMatchStats(body, startTime);

        return new Response(JSON.stringify(report, null, 2), {
          headers: {
            ...corsHeaders,
            'X-Serverless-Engine': 'Cloudflare-Worker-V8',
            'Server-Timing': `compute;dur=${report.executionTimeMs}`
          },
          status: 200
        });
      } catch (err: any) {
        return new Response(
          JSON.stringify({
            error: 'Erro no processamento da função serverless',
            details: err.message
          }),
          { headers: corsHeaders, status: 500 }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: `Método ${request.method} na rota ${url.pathname} não suportado.` }),
      { headers: corsHeaders, status: 404 }
    );
  }
};
