# Servix

Plataforma completa para contratação e gerenciamento de serviços, composta por um backend em Java com Spring Boot e um aplicativo mobile desenvolvido com React Native + Expo.

A aplicação conecta clientes e prestadores de serviço, permitindo cadastro, autenticação, criação de solicitações, envio de propostas, avaliações, favoritos e chat em tempo real.

---

# Tecnologias Utilizadas

## Backend

* Java 21+
* Spring Boot
* Spring Security
* JWT Authentication
* WebSocket
* Maven
* Flyway
* PostgreSQL
* Docker
* Docker Compose

## Mobile

* React Native
* Expo
* TypeScript
* React Navigation
* Zustand
* Axios

---

# Estrutura do Projeto

```bash
Servix/
├── backend/          # API Spring Boot
├── mobile/           # Aplicativo React Native
├── docker-compose.yml
└── seed.sh
```

---

# Funcionalidades

## Autenticação

* Cadastro de usuários
* Login com JWT
* Refresh Token
* Controle de permissões por perfil

## Cliente

* Solicitação de serviços
* Favoritar prestadores
* Visualizar propostas
* Sistema de chat
* Histórico de solicitações
* Avaliação de prestadores

## Prestador

* Cadastro de perfil profissional
* Atualização de disponibilidade
* Recebimento de propostas
* Sistema de avaliações
* Chat em tempo real

## Sistema

* WebSocket para mensagens em tempo real
* Migrações automáticas com Flyway
* API RESTful
* Tratamento global de exceções
* Arquitetura modularizada

---

# Arquitetura Backend

O backend segue arquitetura baseada em camadas:

```bash
controller/   # Endpoints REST
service/      # Regras de negócio
repository/   # Acesso ao banco de dados
entity/       # Entidades JPA
dto/          # Objetos de transferência
security/     # JWT e autenticação
exception/    # Tratamento de erros
```

---

# Banco de Dados

As migrações do banco são gerenciadas pelo Flyway.

Arquivos localizados em:

```bash
backend/src/main/resources/db/migration
```

Principais entidades:

* User
* Provider
* ServiceRequest
* Proposal
* Review
* Favorite
* ChatMessage
* RefreshToken

---

# Como Executar o Projeto

## Pré-requisitos

* Java 21+
* Node.js 18+
* Docker
* Docker Compose
* Expo CLI

---

## Executando com Docker

Na raiz do projeto:

```bash
docker-compose up --build
```

---

# Configuração do Backend

## 1. Acesse a pasta backend

```bash
cd backend
```

## 2. Configure as variáveis de ambiente

Copie o arquivo:

```bash
.env.example
```

E configure as variáveis necessárias.

## 3. Execute a aplicação

```bash
./mvnw spring-boot:run
```

Ou:

```bash
mvn spring-boot:run
```

---

# Configuração do Mobile

## 1. Acesse a pasta mobile

```bash
cd mobile
```

## 2. Instale as dependências

```bash
npm install
```

## 3. Execute o projeto

```bash
npx expo start
```

---

# Endpoints Principais

## Autenticação

* `POST /auth/register`
* `POST /auth/login`
* `POST /auth/refresh`

## Prestadores

* `GET /providers`
* `POST /providers/profile`

## Solicitações

* `POST /requests`
* `GET /requests`
* `PATCH /requests/status`

## Favoritos

* `POST /favorites`
* `GET /favorites`

## Avaliações

* `POST /reviews`
* `GET /reviews`

## Chat

* WebSocket para comunicação em tempo real

---

# Segurança

A aplicação utiliza:

* Spring Security
* JWT Authentication
* Controle de acesso por roles
* Refresh Tokens
* Interceptadores WebSocket autenticados

---

# Padrões Utilizados

* REST API
* DTO Pattern
* Repository Pattern
* Service Layer
* Exception Handler Global
* Clean Code
* Modularização por domínio

---

# Telas do Aplicativo

## Cliente

* Home
* Perfil do prestador
* Solicitações
* Favoritos
* Pagamentos
* Chat
* Notificações

## Prestador

* Dashboard
* Cadastro profissional
* Propostas
* Avaliações recebidas
* Ganhos
* Chat

---

# Melhorias Futuras

* Integração com gateway de pagamento
* Upload de imagens
* Notificações push
* Geolocalização
* Dashboard administrativo
* Sistema de agendamento avançado
* Deploy em nuvem AWS

---

# Desenvolvedores

Projeto desenvolvido para fins acadêmicos e prática de desenvolvimento full stack mobile e backend.

---

# Licença

Este projeto possui finalidade educacional.
