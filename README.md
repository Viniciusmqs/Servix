# Servix

Marketplace mobile que conecta clientes que precisam de serviços domésticos a prestadores de serviço qualificados. Rápido, seguro e transparente.

---

## 👥 Integrantes

| Nome | Matrícula | Atribuições |
|------|-----------|-------------|
| Vinícius Marques | UC22200344 | Backend (Spring Boot, API REST, JWT, MercadoPago), banco de dados, Docker, arquitetura geral |
| Lucas Teles | UC22200482 | Frontend mobile (React Native + Expo), UI/UX, navegação, integração com API |

---

## 📱 Sobre o App

O **Servix** é um marketplace de dupla-face:
- **Cliente**: cria solicitações de serviço com fotos, acompanha em tempo real, paga via MercadoPago e avalia
- **Prestador**: recebe pedidos do marketplace, aceita, executa, acompanha agenda e saca ganhos

**Categorias**: Elétrica, Hidráulica, Limpeza, Pintura, TI, Jardinagem, Montagem, Segurança, Reformas, Outros

---

## 🛠️ Stack

| Camada | Tecnologia |
|--------|-----------|
| Mobile | React Native + Expo 54, TypeScript |
| Backend | Spring Boot 3.2.5, Java 21 |
| Banco | PostgreSQL 16 |
| Cache | Redis 7 |
| Auth | Spring Security + JWT |
| Pagamento | MercadoPago SDK Java |
| Infra | Docker + Docker Compose |

---

## ✅ Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e rodando
- [Node.js 20+](https://nodejs.org/)
- [Expo Go](https://expo.dev/go) instalado no celular (iOS ou Android)

---

## 🚀 Como Executar

### 1. Clone o repositório

```bash
git clone https://github.com/Viniciusmqs/Servix.git
cd Servix
git checkout entrega-final
```

### 2. Suba o backend (API + Banco + Cache)

```bash
docker compose up -d
```

> Aguarde ~30 segundos para todos os containers iniciarem.

Verifique se está rodando:
```bash
docker compose ps
```

Os três containers devem estar `running`:
- `servix-postgres` — PostgreSQL na porta **5433**
- `servix-redis` — Redis na porta **6379**
- `servix-backend` — API Spring Boot na porta **8080**

### 3. Popule o banco com dados iniciais (seed)

```bash
docker exec -i servix-postgres psql -U servix -d servix < seed.sql
```

> Isso cria categorias, usuários de teste e solicitações de exemplo.

### 4. Instale as dependências do app mobile

```bash
cd mobile
npm install
```

### 5. Configure o IP do backend no app

Abra o arquivo `mobile/src/services/api.ts` e atualize o `BASE_URL` com o IP da sua máquina na rede local:

```typescript
// Troque pelo IP do seu computador (veja com: ifconfig | grep 192)
const BASE_URL = 'http://SEU_IP_AQUI:8080/api';
```

Para descobrir seu IP:
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

### 6. Rode o app

```bash
cd mobile
npx expo start
```

Escaneie o QR Code com o **Expo Go** no celular.

---

## 👤 Usuários de Teste

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Cliente | lucas.oliveira@gmail.com | Servix@123 |
| Prestador | marco@servix.com | Servix@123 |

---

## 📂 Estrutura do Projeto

```
Servix/
├── docker-compose.yml       # Orquestração dos containers
├── seed.sql                 # Dados iniciais (categorias, usuários)
├── README.md
└── mobile/                  # App React Native
    ├── app.json             # Config Expo
    ├── src/
    │   ├── screens/         # Telas (client/, provider/, auth/)
    │   ├── services/        # Chamadas à API REST
    │   ├── navigation/      # Stack e Tab navigators
    │   ├── store/           # Estado global (Zustand)
    │   ├── types/           # Tipos TypeScript
    │   └── constants/       # Cores, constantes
    └── assets/              # Ícones e imagens
```

---

## 🔌 Endpoints principais da API

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/auth/register | Cadastro |
| POST | /api/auth/login | Login (retorna JWT) |
| GET | /api/requests | Marketplace de pedidos |
| POST | /api/requests | Criar solicitação |
| PUT | /api/requests/{id}/accept | Aceitar pedido |
| PUT | /api/requests/{id}/complete | Concluir pedido |
| GET | /api/chat/requests/{id}/messages | Mensagens do chat |
| POST | /api/chat/requests/{id}/messages | Enviar mensagem |
| POST | /api/payments/preference | Criar preferência MercadoPago |
| GET | /api/providers | Lista prestadores |
| POST | /api/reviews | Avaliar prestador |

---

## 🐛 Problemas comuns

**Porta 8080 em uso:**
```bash
lsof -ti :8080 | xargs kill -9
docker compose up -d
```

**App não conecta na API:**
- Verifique se o celular e o computador estão na mesma rede Wi-Fi
- Confirme o IP correto em `mobile/src/services/api.ts`

**Banco não inicializou:**
```bash
docker compose down -v
docker compose up -d
```
