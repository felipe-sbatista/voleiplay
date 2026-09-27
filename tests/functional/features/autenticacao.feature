# language: pt
Funcionalidade: Autenticação e Gestão de Sessão
  Como usuário do Voleiplay Beach Pro Tour
  Quero me autenticar com minhas credenciais
  Para acessar recursos restritos e encerrar minha sessão com segurança

  Cenário: Login bem-sucedido com credenciais oficiais de Atleta
    Dado que existe o usuário cadastrado "ana.patricia@voleiplay.com.br" com a senha "atleta123"
    Quando eu realizo o login com o e-mail "ana.patricia@voleiplay.com.br" e senha "atleta123"
    Então a resposta da API de autenticação deve ter status 200
    E a sessão deve retornar o papel "ATHLETE"
    E uma consulta com o token recebido no endpoint "/api/auth/me" deve validar a sessão do usuário

  Cenário: Rejeição de login com senha incorreta
    Dado que existe o usuário cadastrado "ana.patricia@voleiplay.com.br"
    Quando eu tento realizar o login com o e-mail "ana.patricia@voleiplay.com.br" e senha "senha_invalida_999"
    Então a resposta da API de autenticação deve retornar erro com status 401
    E a mensagem de erro deve conter "Credenciais inválidas"

  Cenário: Encerramento de sessão (Logout)
    Dado que o usuário "duda.lisboa@voleiplay.com.br" está autenticado com sessão ativa
    Quando o usuário solicita o encerramento da sessão
    Então a resposta de logout deve ter status 200
    E uma nova tentativa de validação com o token anterior deve ser rejeitada com status 401
