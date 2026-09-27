# language: pt
Funcionalidade: Resiliência e Gateway com Circuit Breaker
  Como arquiteto do sistema Voleiplay
  Quero que as chamadas entre microsserviços sejam protegidas por Circuit Breaker e Gateway Proxy
  Para garantir tolerância a falhas e isolamento de incidentes

  Cenário: Acesso às estatísticas de autenticação através do Gateway Proxy
    Dado que o Gateway na porta 3000 e o serviço de autenticação na porta 3007 estão operacionais
    Quando uma requisição GET é enviada para o Gateway no endpoint "/services/auth/stats"
    Então o status retornado pelo Gateway deve ser 200
    E a resposta deve conter a contagem de "totalUsers" maior ou igual a 4

  Cenário: Monitoramento e reset do Circuit Breaker de e-mail via Gateway
    Dado que o Gateway expõe o status do Circuit Breaker de e-mail
    Quando eu consulto o endpoint do Gateway "/services/email/circuit-breaker"
    Então o status do Circuit Breaker deve ser "CLOSED"
    E o número de falhas registradas deve ser zero após o reset
