# language: pt
Funcionalidade: Cadastro de Usuário e Notificação de Boas-Vindas
  Como um atleta ou fã de vôlei de praia
  Quero me cadastrar na plataforma Voleiplay
  Para ter acesso aos torneios e receber uma confirmação oficial por e-mail

  Cenário: Cadastro bem-sucedido de atleta com disparo de e-mail de boas-vindas
    Dado que os serviços de Autenticação e E-mail estão operacionais
    Quando o atleta "Alison Cerutti" com e-mail "alison.mamute@voleiplay.com.br" e perfil "ATHLETE" realiza o cadastro com a senha "mamute123"
    Então a resposta da API de autenticação deve ter status 201
    E a resposta deve conter um token de sessão válido no padrão "vptok_"
    E o usuário retornado deve ter o nome "Alison Cerutti" e papel "ATHLETE"
    E uma notificação de e-mail de boas-vindas deve existir na caixa de saída do serviço de e-mail para "alison.mamute@voleiplay.com.br"

  Cenário: Tentativa de cadastro com e-mail já existente
    Dado que existe um usuário cadastrado com e-mail "admin@voleiplay.com.br"
    Quando eu tento cadastrar um novo usuário com o mesmo e-mail "admin@voleiplay.com.br"
    Então a resposta da API de autenticação deve retornar erro com status 400
    E a mensagem de erro deve conter "Já existe um usuário cadastrado"
