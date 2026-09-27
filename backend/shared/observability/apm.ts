/**
 * Módulo Central de Observabilidade e Telemetria (Elastic APM)
 * 
 * NOTA DIDÁTICA:
 * O Elastic APM Agent deve ser SEMPRE importado e iniciado antes de qualquer
 * outro módulo (Express, HTTP, banco de dados, etc.) para que o mecanismo de
 * 'monkey-patching' (auto-instrumentação) capture requisições, rotas, latências
 * e erros automaticamente.
 */
import apm, { Agent } from 'elastic-apm-node';

const isApmActive = process.env.ELASTIC_APM_ACTIVE !== 'false';
const serviceName = process.env.ELASTIC_APM_SERVICE_NAME || 'voleiplay-backend';
const serverUrl = process.env.ELASTIC_APM_SERVER_URL || 'http://localhost:8200';

export const apmAgent: Agent = apm.start({
  serviceName,
  serverUrl,
  environment: process.env.NODE_ENV || 'development',
  active: isApmActive,
  captureBody: 'all',
  captureErrorLogStackTraces: 'always',
  logLevel: (process.env.ELASTIC_APM_LOG_LEVEL as any) || 'warn',
  metricsInterval: '10s',
  cloudProvider: 'none', // Não perde tempo consultando AWS/GCP/Azure em ambiente local
  centralConfig: false,
  stackTraceLimit: 50,
});

if (apmAgent.isStarted()) {
  console.log(`📡 [Observability] Elastic APM Agent inicializado para o serviço: "${serviceName}"`);
  console.log(`🎯 [Observability] APM Server alvo: ${serverUrl}`);
} else {
  console.warn(`⚠️ [Observability] Elastic APM Agent está inativo ou configurado para desativado.`);
}

/**
 * Utilitários Didáticos para Sala de Aula:
 * Permitem demonstrar Spans Manuais, Contextos de Negócio e Captura de Falhas
 */
export const Observability = {
  agent: apmAgent,

  /**
   * Cria e inicia um Span customizado dentro da transação atual.
   * Útil para medir operações de negócio, algoritmos pesados ou chamadas externas.
   */
  startSpan(name: string, type: string = 'custom', subtype?: string, action?: string) {
    return apmAgent.startSpan(name, type, subtype ?? null, action ?? null);
  },

  /**
   * Adiciona etiquetas (labels/tags) à transação ativa para facilitar
   * a busca e filtragem no Kibana APM (ex: ticketId, playerId, sagaStatus).
   */
  setLabel(name: string, value: string | number | boolean) {
    apmAgent.setLabel(name, value);
  },

  /**
   * Vincula um usuário/aluno à transação atual no APM.
   */
  setUser(id: string, username?: string, email?: string) {
    apmAgent.setUserContext({ id, username, email });
  },

  /**
   * Adiciona metadados estruturados customizados para auditoria e depuração.
   */
  setCustomContext(context: Record<string, any>) {
    apmAgent.setCustomContext(context);
  },

  /**
   * Captura manualmente um erro com contexto enriquecido e envia para o APM Server.
   */
  captureError(err: Error | string, customContext?: Record<string, any>) {
    if (customContext) {
      apmAgent.setCustomContext(customContext);
    }
    return apmAgent.captureError(err);
  }
};

export default apmAgent;
