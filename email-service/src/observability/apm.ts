/**
 * Módulo de Observabilidade e Elastic APM para o Microsserviço de E-mail
 * Deve ser importado antes de qualquer outro módulo para auto-instrumentação (monkey-patching).
 */
import apm, { Agent } from 'elastic-apm-node';

const isApmActive = process.env.ELASTIC_APM_ACTIVE !== 'false';
const serviceName = process.env.ELASTIC_APM_SERVICE_NAME || 'voleiplay-email-service';
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
  cloudProvider: 'none',
  centralConfig: false,
  stackTraceLimit: 50
});

if (apmAgent.isStarted()) {
  console.log(`📡 [Email Service APM] Elastic APM Agent ativo para o serviço: "${serviceName}"`);
  console.log(`🎯 [Email Service APM] APM Server: ${serverUrl}`);
} else {
  console.warn(`⚠️ [Email Service APM] Elastic APM Agent desativado.`);
}

export const EmailObservability = {
  agent: apmAgent,
  startSpan(name: string, type: string = 'custom', subtype?: string, action?: string) {
    return apmAgent.startSpan(name, type, subtype, action);
  },
  setLabel(name: string, value: string | number | boolean) {
    apmAgent.setLabel(name, value);
  },
  captureError(err: Error, customContext?: Record<string, any>) {
    return apmAgent.captureError(err, { custom: customContext });
  }
};
