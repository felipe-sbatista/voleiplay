import {
  EmailMessage,
  SendEmailDto,
  SendBatchEmailsDto,
  CompensateEmailDto,
  EmailStats
} from '../email-service/email.types.js';
import { Observability } from '../../shared/observability/apm.js';
import { CircuitBreaker, CircuitBreakerStats } from '../../shared/resilience/circuit-breaker.js';
import { withRetry } from '../../shared/resilience/retry-backoff.js';

export class EmailServiceClient {
  private baseUrl: string;
  private circuitBreaker: CircuitBreaker;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.EMAIL_SERVICE_URL || 'http://localhost:3004';
    this.circuitBreaker = new CircuitBreaker({
      name: 'EmailServiceAPI',
      failureThreshold: 3,      // Abre o circuito após 3 falhas
      resetTimeoutMs: 5000,     // Aguarda 5s em OPEN antes de testar em HALF_OPEN
      successThreshold: 2       // Requer 2 sucessos em HALF_OPEN para fechar o circuito
    });
  }

  /**
   * Dispara o envio de um lote de e-mails protegido por Circuit Breaker e Retry com Backoff
   */
  async sendBatch(dto: SendBatchEmailsDto): Promise<{ sent: EmailMessage[]; count: number }> {
    return this.circuitBreaker.execute(async () => {
      return withRetry(
        async (attempt) => {
          const url = `${this.baseUrl}/api/emails/send-batch`;
          console.log(`\x1b[36m[EmailServiceClient] 🌐 REST POST -> ${url} (${dto.emails.length} e-mails) [Tentativa ${attempt}]...\x1b[0m`);

          const span = Observability.startSpan('REST Call: EmailService send-batch', 'http', 'email-service', 'send-batch');

          try {
            const response = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify(dto)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
              throw new Error(data.error || `Falha na API de E-mail: HTTP ${response.status}`);
            }

            console.log(`\x1b[32m[EmailServiceClient] ✔ Resposta REST recebida com sucesso: ${data.count} e-mails processados.\x1b[0m`);
            return { sent: data.sent, count: data.count };
          } catch (err: any) {
            console.error(`\x1b[31m[EmailServiceClient] ✖ Erro ao contatar a API de e-mail (${url}):\x1b[0m`, err.message);
            if (err.cause?.code === 'ECONNREFUSED' || err.message.includes('fetch failed')) {
              throw new Error(
                `[EmailServiceClient] Não foi possível conectar ao serviço de e-mail em ${this.baseUrl}. ` +
                `Verifique se o microsserviço está ativo (execute: npm run email:dev).`
              );
            }
            throw err;
          } finally {
            span?.end();
          }
        },
        {
          operationName: 'EmailService.sendBatch',
          maxAttempts: 3,
          initialDelayMs: 300,
          backoffFactor: 2,
          jitter: true
        }
      );
    });
  }

  /**
   * Executa a transação compensatória protegida por Circuit Breaker e Retry
   */
  async compensateBatch(dto: CompensateEmailDto): Promise<{ compensatedEmails: EmailMessage[] }> {
    return this.circuitBreaker.execute(async () => {
      return withRetry(
        async (attempt) => {
          const url = `${this.baseUrl}/api/emails/compensate`;
          console.log(`\x1b[33m[EmailServiceClient] 🌐 REST POST (Compensação) -> ${url} (${dto.recipients.length} destinatários) [Tentativa ${attempt}]...\x1b[0m`);

          const span = Observability.startSpan('REST Call: EmailService compensate', 'http', 'email-service', 'compensate');

          try {
            const response = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify(dto)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
              throw new Error(data.error || `Falha na compensação via API de E-mail: HTTP ${response.status}`);
            }

            console.log(`\x1b[32m[EmailServiceClient] ✔ Compensação confirmada pela API de E-mail via REST.\x1b[0m`);
            return { compensatedEmails: data.compensatedEmails };
          } catch (err: any) {
            console.error(`\x1b[31m[EmailServiceClient] ✖ Erro na compensação REST via ${url}:\x1b[0m`, err.message);
            if (err.cause?.code === 'ECONNREFUSED' || err.message.includes('fetch failed')) {
              throw new Error(
                `[EmailServiceClient] Não foi possível conectar ao serviço de e-mail em ${this.baseUrl} durante a compensação.`
              );
            }
            throw err;
          } finally {
            span?.end();
          }
        },
        {
          operationName: 'EmailService.compensateBatch',
          maxAttempts: 3,
          initialDelayMs: 300,
          backoffFactor: 2,
          jitter: true
        }
      );
    });
  }

  /**
   * Envia um e-mail avulso com Circuit Breaker e Retry
   */
  async sendEmail(dto: SendEmailDto): Promise<EmailMessage> {
    return this.circuitBreaker.execute(async () => {
      return withRetry(
        async (attempt) => {
          const url = `${this.baseUrl}/api/emails/send`;
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dto)
          });
          const data = await response.json();
          if (!response.ok || !data.success) {
            throw new Error(data.error || `HTTP ${response.status}`);
          }
          return data.email;
        },
        {
          operationName: 'EmailService.sendEmail',
          maxAttempts: 3,
          initialDelayMs: 250,
          backoffFactor: 2
        }
      );
    });
  }

  /**
   * Consulta a lista de e-mails enviados na API externa
   */
  async listSent(limit = 50): Promise<EmailMessage[]> {
    const url = `${this.baseUrl}/api/emails?limit=${limit}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.emails || [];
  }

  /**
   * Consulta estatísticas na API externa
   */
  async getStats(): Promise<EmailStats> {
    const url = `${this.baseUrl}/api/emails/stats`;
    const response = await fetch(url);
    const data = await response.json();
    return data.stats;
  }

  /**
   * Limpa a caixa de saída na API externa
   */
  async clear(): Promise<void> {
    const url = `${this.baseUrl}/api/emails`;
    await fetch(url, { method: 'DELETE' });
  }

  /**
   * Verifica o healthcheck da API de e-mails
   */
  async checkHealth(): Promise<{ status: string; url: string; online: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/emails/health`, { signal: AbortSignal.timeout(2000) });
      const data = await response.json();
      return { status: data.status || 'UP', url: this.baseUrl, online: response.ok };
    } catch {
      return { status: 'OFFLINE', url: this.baseUrl, online: false };
    }
  }

  /**
   * Obtém as estatísticas e estado atual do Circuit Breaker
   */
  getCircuitBreakerStatus(): CircuitBreakerStats {
    return this.circuitBreaker.getStats();
  }

  /**
   * Reseta manualmente o Circuit Breaker para o estado CLOSED
   */
  resetCircuitBreaker(): void {
    this.circuitBreaker.reset();
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }
}

export const emailServiceClient = new EmailServiceClient();
