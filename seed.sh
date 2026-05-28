#!/bin/bash  
set -e

BASE="http://localhost:8080/api"
PSQL="docker exec -i servix-postgres psql -U servix -d servix"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║       SERVIX — SEED DE DADOS REAIS       ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ─────────────────────────────────────────────────────
# 1. LIMPA DADOS ANTERIORES (ordem reversa de FK)
# ─────────────────────────────────────────────────────
echo "🗑️  Limpando dados anteriores..."
echo "TRUNCATE refresh_tokens, chat_messages, reviews, proposals, service_requests, favorites, providers, users RESTART IDENTITY CASCADE;" | $PSQL -q
echo "✅ Banco limpo."
echo ""

# ─────────────────────────────────────────────────────
# 2. REGISTRA USUÁRIOS VIA API (senha corretamente hashada)
# ─────────────────────────────────────────────────────
echo "👤 Criando usuários..."

register() {
  local NAME="$1" EMAIL="$2" PHONE="$3" PASS="$4"
  curl -sf -X POST "$BASE/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$NAME\",\"email\":\"$EMAIL\",\"phone\":\"$PHONE\",\"password\":\"$PASS\"}" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['user']['id']+'|'+d['token'])"
}

# Cliente principal
RES_JOAO=$(register "João da Silva" "joao@servix.com" "(11) 99999-1111" "Servix@123")
ID_JOAO=$(echo $RES_JOAO | cut -d'|' -f1)
TK_JOAO=$(echo $RES_JOAO | cut -d'|' -f2)
echo "   Cliente João: $ID_JOAO"

# Prestadores
RES_MARCO=$(register "Marco Ferreira" "marco@servix.com" "(11) 98888-2222" "Servix@123")
ID_MARCO=$(echo $RES_MARCO | cut -d'|' -f1)
TK_MARCO=$(echo $RES_MARCO | cut -d'|' -f2)
echo "   Prestador Marco: $ID_MARCO"

RES_ANA=$(register "Ana Souza" "ana@servix.com" "(11) 97777-3333" "Servix@123")
ID_ANA=$(echo $RES_ANA | cut -d'|' -f1)
TK_ANA=$(echo $RES_ANA | cut -d'|' -f2)
echo "   Prestadora Ana: $ID_ANA"

RES_CARLOS=$(register "Carlos Lima" "carlos@servix.com" "(11) 96666-4444" "Servix@123")
ID_CARLOS=$(echo $RES_CARLOS | cut -d'|' -f1)
TK_CARLOS=$(echo $RES_CARLOS | cut -d'|' -f2)
echo "   Prestador Carlos: $ID_CARLOS"

RES_LUCIA=$(register "Luciana Pereira" "luciana@servix.com" "(11) 95555-5555" "Servix@123")
ID_LUCIA=$(echo $RES_LUCIA | cut -d'|' -f1)
TK_LUCIA=$(echo $RES_LUCIA | cut -d'|' -f2)
echo "   Prestadora Luciana: $ID_LUCIA"

# Cliente secundário (para aparecer em solicitações do prestador)
RES_PEDRO=$(register "Pedro Alves" "pedro@servix.com" "(11) 94444-6666" "Servix@123")
ID_PEDRO=$(echo $RES_PEDRO | cut -d'|' -f1)
TK_PEDRO=$(echo $RES_PEDRO | cut -d'|' -f2)
echo "   Cliente Pedro: $ID_PEDRO"

echo ""

# ─────────────────────────────────────────────────────
# 3. DEFINE ROLES VIA API
# ─────────────────────────────────────────────────────
echo "🎭 Definindo papéis..."

set_role() {
  local TOKEN="$1" ROLE="$2"
  curl -sf -X PATCH "$BASE/auth/role" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"role\":\"$ROLE\"}" > /dev/null
}

set_role "$TK_JOAO"   "CLIENT"
set_role "$TK_PEDRO"  "CLIENT"
set_role "$TK_MARCO"  "PROVIDER"
set_role "$TK_ANA"    "PROVIDER"
set_role "$TK_CARLOS" "PROVIDER"
set_role "$TK_LUCIA"  "PROVIDER"

echo "   ✅ Roles definidos."
echo ""

# ─────────────────────────────────────────────────────
# 4. PERFIS DE PRESTADORES (SQL direto)
# ─────────────────────────────────────────────────────
echo "🔧 Criando perfis de prestadores..."

cat <<SQL | $PSQL -q
INSERT INTO providers (id, user_id, category, description, hourly_rate, rating, total_reviews, latitude, longitude, is_available, city)
VALUES
  (gen_random_uuid(), '$ID_MARCO',  'Elétrica',   'Eletricista com 12 anos de experiência em instalações residenciais e comerciais. Atendo SP e região. CREA-SP 123456.',  80.00, 4.90, 87,  -23.5613, -46.6558, true,  'São Paulo'),
  (gen_random_uuid(), '$ID_ANA',    'Limpeza',    'Diarista e faxineira profissional com produtos próprios. Especialista em limpeza pós-obra. 8 anos de experiência.',       60.00, 4.60, 54,  -23.5735, -46.6431, true,  'São Paulo'),
  (gen_random_uuid(), '$ID_CARLOS', 'Hidráulica', 'Encanador especialista em vazamentos, desentupimentos e instalação de registros. Atendo com rapidez e garantia.',       70.00, 4.80, 63,  -23.5489, -46.6388, false, 'São Paulo'),
  (gen_random_uuid(), '$ID_LUCIA',  'Pintura',    'Pintora residencial e comercial. Trabalho com tinta acrílica, latex e textura. Orçamento sem compromisso.',             55.00, 5.00, 112, -23.5601, -46.6584, true,  'São Paulo');

UPDATE providers SET rating = 4.90, total_reviews = 87  WHERE user_id = '$ID_MARCO';
UPDATE providers SET rating = 4.60, total_reviews = 54  WHERE user_id = '$ID_ANA';
UPDATE providers SET rating = 4.80, total_reviews = 63  WHERE user_id = '$ID_CARLOS';
UPDATE providers SET rating = 5.00, total_reviews = 112 WHERE user_id = '$ID_LUCIA';
SQL

echo "   ✅ Perfis criados."
echo ""

# ─────────────────────────────────────────────────────
# 5. SOLICITAÇÕES DE SERVIÇO
# ─────────────────────────────────────────────────────
echo "📋 Criando solicitações de serviço..."

cat <<SQL | $PSQL -q
-- Joao solicitou Marco (em andamento)
INSERT INTO service_requests (id, client_id, provider_id, title, description, category, status, scheduled_at, address, budget_min, budget_max, created_at, updated_at)
VALUES
  ('$(uuidgen | tr '[:upper:]' '[:lower:]')', '$ID_JOAO', '$ID_MARCO',
   'Instalação elétrica', 'Preciso instalar 3 tomadas novas no quarto e 2 na sala. Apartamento de 2 quartos no Pinheiros.',
   'Elétrica', 'IN_PROGRESS',
   NOW() + INTERVAL '1 day',
   'Rua das Flores, 123 — Pinheiros, São Paulo',
   150.00, 250.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day');

-- Joao solicitou Ana (concluído)
INSERT INTO service_requests (id, client_id, provider_id, title, description, category, status, scheduled_at, address, budget_min, budget_max, created_at, updated_at)
VALUES
  ('$(uuidgen | tr '[:upper:]' '[:lower:]')', '$ID_JOAO', '$ID_ANA',
   'Faxina completa', 'Limpeza completa do apartamento de 65m², incluindo banheiros, cozinha e quartos.',
   'Limpeza', 'COMPLETED',
   NOW() - INTERVAL '5 days',
   'Rua das Flores, 123 — Pinheiros, São Paulo',
   100.00, 200.00, NOW() - INTERVAL '10 days', NOW() - INTERVAL '5 days');

-- Joao solicitou Carlos (pendente — aguardando proposta)
INSERT INTO service_requests (id, client_id, provider_id, title, description, category, status, scheduled_at, address, budget_min, budget_max, created_at, updated_at)
VALUES
  ('$(uuidgen | tr '[:upper:]' '[:lower:]')', '$ID_JOAO', '$ID_CARLOS',
   'Vazamento na cozinha', 'Torneira da pia da cozinha com vazamento. Preciso de reparo urgente.',
   'Hidráulica', 'PENDING',
   NULL,
   'Rua das Flores, 123 — Pinheiros, São Paulo',
   80.00, 150.00, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour');

-- Pedro solicitou Marco (novo — para aparecer no painel do prestador)
INSERT INTO service_requests (id, client_id, provider_id, title, description, category, status, scheduled_at, address, budget_min, budget_max, created_at, updated_at)
VALUES
  ('$(uuidgen | tr '[:upper:]' '[:lower:]')', '$ID_PEDRO', '$ID_MARCO',
   'Troca de disjuntor', 'Disjuntor do quadro de luz queimou. Preciso de troca com urgência.',
   'Elétrica', 'PENDING',
   NULL,
   'Av. Brasil, 456 — Vila Madalena, São Paulo',
   100.00, 200.00, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes');

-- Pedro solicitou Lucia (cancelado)
INSERT INTO service_requests (id, client_id, provider_id, title, description, category, status, scheduled_at, address, budget_min, budget_max, created_at, updated_at)
VALUES
  ('$(uuidgen | tr '[:upper:]' '[:lower:]')', '$ID_PEDRO', '$ID_LUCIA',
   'Pintura do quarto', 'Quarto de 12m², preciso pintar 2 demãos em tinta branca.',
   'Pintura', 'CANCELLED',
   NULL,
   'Av. Brasil, 456 — Vila Madalena, São Paulo',
   200.00, 400.00, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days');
SQL

echo "   ✅ Solicitações criadas."
echo ""

# Pega IDs das solicitações para usar abaixo
REQ_ELETRICA=$(echo "SELECT id FROM service_requests WHERE client_id='$ID_JOAO' AND category='Elétrica' AND status='IN_PROGRESS' LIMIT 1;" | $PSQL -t -q | tr -d ' ')
REQ_FAXINA=$(echo "SELECT id FROM service_requests WHERE client_id='$ID_JOAO' AND category='Limpeza' LIMIT 1;" | $PSQL -t -q | tr -d ' ')
REQ_VAZAMENTO=$(echo "SELECT id FROM service_requests WHERE client_id='$ID_JOAO' AND category='Hidráulica' LIMIT 1;" | $PSQL -t -q | tr -d ' ')
REQ_DISJUNTOR=$(echo "SELECT id FROM service_requests WHERE client_id='$ID_PEDRO' AND category='Elétrica' LIMIT 1;" | $PSQL -t -q | tr -d ' ')

echo "   REQ_ELETRICA:  $REQ_ELETRICA"
echo "   REQ_FAXINA:    $REQ_FAXINA"
echo "   REQ_VAZAMENTO: $REQ_VAZAMENTO"
echo "   REQ_DISJUNTOR: $REQ_DISJUNTOR"
echo ""

# ─────────────────────────────────────────────────────
# 6. PROPOSTAS
# ─────────────────────────────────────────────────────
echo "💼 Criando propostas..."

cat <<SQL | $PSQL -q
INSERT INTO proposals (request_id, provider_id, price, estimated_duration, message, status, created_at, updated_at)
VALUES
  ('$REQ_ELETRICA', '$ID_MARCO',
   180.00, '3 horas',
   'Posso atender amanhã às 9h. Incluo mão de obra e materiais básicos (tomadas e fios). Garantia de 90 dias.',
   'ACCEPTED', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

  ('$REQ_FAXINA', '$ID_ANA',
   150.00, '4 horas',
   'Faço limpeza completa com produtos próprios e equipamentos profissionais. Disponível na semana.',
   'ACCEPTED', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),

  ('$REQ_VAZAMENTO', '$ID_CARLOS',
   120.00, '2 horas',
   'Posso verificar e resolver o vazamento ainda hoje à tarde. Cobro visita + mão de obra.',
   'PENDING', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes');
SQL

echo "   ✅ Propostas criadas."
echo ""

# ─────────────────────────────────────────────────────
# 7. AVALIAÇÕES
# ─────────────────────────────────────────────────────
echo "⭐ Criando avaliações..."

cat <<SQL | $PSQL -q
INSERT INTO reviews (request_id, reviewer_id, reviewee_id, rating, comment, created_at)
VALUES
  ('$REQ_FAXINA', '$ID_JOAO', '$ID_ANA',
   5, 'Serviço impecável! Ana foi super pontual, cuidadosa e deixou o apartamento brilhando. Super recomendo!',
   NOW() - INTERVAL '4 days');
SQL

# Atualiza rating da Ana com base na nova review
cat <<SQL | $PSQL -q
UPDATE providers
SET rating = (
  SELECT ROUND(AVG(r.rating)::numeric, 2)
  FROM reviews r WHERE r.reviewee_id = '$ID_ANA'
),
total_reviews = (
  SELECT COUNT(*) FROM reviews r WHERE r.reviewee_id = '$ID_ANA'
)
WHERE user_id = '$ID_ANA';
SQL

echo "   ✅ Avaliações criadas."
echo ""

# ─────────────────────────────────────────────────────
# 8. MENSAGENS DE CHAT
# ─────────────────────────────────────────────────────
echo "💬 Criando mensagens de chat..."

cat <<SQL | $PSQL -q
INSERT INTO chat_messages (request_id, sender_id, receiver_id, content, type, read_at, created_at)
VALUES
  -- Chat da instalação elétrica (João ↔ Marco)
  ('$REQ_ELETRICA', '$ID_MARCO', '$ID_JOAO',
   'Olá João! Vi sua solicitação de instalação elétrica. Posso atender amanhã às 9h. Valor: R$ 180.', 'TEXT', NOW() - INTERVAL '1 day 2 hours', NOW() - INTERVAL '1 day 2 hours'),
  ('$REQ_ELETRICA', '$ID_JOAO', '$ID_MARCO',
   'Perfeito Marco! Pode confirmar o endereço?', 'TEXT', NOW() - INTERVAL '1 day 1 hour 50 minutes', NOW() - INTERVAL '1 day 1 hour 50 minutes'),
  ('$REQ_ELETRICA', '$ID_MARCO', '$ID_JOAO',
   'Claro! Confirma Rua das Flores, 123 — Pinheiros?', 'TEXT', NOW() - INTERVAL '1 day 1 hour 45 minutes', NOW() - INTERVAL '1 day 1 hour 45 minutes'),
  ('$REQ_ELETRICA', '$ID_JOAO', '$ID_MARCO',
   'Exato! Apto 42. Até amanhã!', 'TEXT', NOW() - INTERVAL '1 day 1 hour 40 minutes', NOW() - INTERVAL '1 day 1 hour 40 minutes'),
  ('$REQ_ELETRICA', '$ID_MARCO', '$ID_JOAO',
   'Anotado. Estarei às 9h em ponto. 👍', 'TEXT', null, NOW() - INTERVAL '1 day 1 hour 30 minutes'),

  -- Chat da faxina (João ↔ Ana)
  ('$REQ_FAXINA', '$ID_ANA', '$ID_JOAO',
   'Olá! Posso fazer a limpeza na sexta-feira de manhã. R$ 150 com produtos inclusos.', 'TEXT', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'),
  ('$REQ_FAXINA', '$ID_JOAO', '$ID_ANA',
   'Ótimo Ana! Sexta está perfeito.', 'TEXT', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'),
  ('$REQ_FAXINA', '$ID_ANA', '$ID_JOAO',
   'Serviço concluído! Espero que tenha ficado do seu agrado 😊', 'TEXT', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),

  -- Chat do vazamento (João ↔ Carlos)
  ('$REQ_VAZAMENTO', '$ID_CARLOS', '$ID_JOAO',
   'Olá João! Posso ir ver o vazamento hoje à tarde. Qual o horário melhor para você?', 'TEXT', null, NOW() - INTERVAL '25 minutes');
SQL

echo "   ✅ Mensagens criadas."
echo ""

# ─────────────────────────────────────────────────────
# 9. FAVORITOS
# ─────────────────────────────────────────────────────
echo "❤️  Criando favoritos..."

ID_PROVIDER_MARCO=$(echo "SELECT id FROM providers WHERE user_id='$ID_MARCO';" | $PSQL -t -q | tr -d ' ')
ID_PROVIDER_ANA=$(echo "SELECT id FROM providers WHERE user_id='$ID_ANA';" | $PSQL -t -q | tr -d ' ')
ID_PROVIDER_LUCIA=$(echo "SELECT id FROM providers WHERE user_id='$ID_LUCIA';" | $PSQL -t -q | tr -d ' ')

cat <<SQL | $PSQL -q
INSERT INTO favorites (client_id, provider_id, created_at)
VALUES
  ('$ID_JOAO', '$ID_PROVIDER_MARCO', NOW() - INTERVAL '5 days'),
  ('$ID_JOAO', '$ID_PROVIDER_ANA',   NOW() - INTERVAL '4 days'),
  ('$ID_PEDRO','$ID_PROVIDER_LUCIA', NOW() - INTERVAL '2 days');
SQL

echo "   ✅ Favoritos criados."
echo ""

# ─────────────────────────────────────────────────────
# 10. RESUMO FINAL
# ─────────────────────────────────────────────────────
echo "════════════════════════════════════════════"
echo "✅  SEED COMPLETO!"
echo "════════════════════════════════════════════"
echo ""
echo "🔑  CREDENCIAIS DE ACESSO:"
echo ""
echo "   👤 CLIENTE"
echo "   Email:  joao@servix.com"
echo "   Senha:  Servix@123"
echo ""
echo "   👤 CLIENTE 2"
echo "   Email:  pedro@servix.com"
echo "   Senha:  Servix@123"
echo ""
echo "   🔧 PRESTADOR (Eletricista)"
echo "   Email:  marco@servix.com"
echo "   Senha:  Servix@123"
echo ""
echo "   🧹 PRESTADORA (Limpeza)"
echo "   Email:  ana@servix.com"
echo "   Senha:  Servix@123"
echo ""
echo "   🚰 PRESTADOR (Hidráulica)"
echo "   Email:  carlos@servix.com"
echo "   Senha:  Servix@123"
echo ""
echo "   🎨 PRESTADORA (Pintura)"
echo "   Email:  luciana@servix.com"
echo "   Senha:  Servix@123"
echo ""
echo "📊 DADOS CRIADOS:"
echo "$(echo "SELECT 'Usuários: ' || COUNT(*) FROM users;" | $PSQL -t -q | tr -d ' ')"
echo "$(echo "SELECT 'Prestadores: ' || COUNT(*) FROM providers;" | $PSQL -t -q | tr -d ' ')"
echo "$(echo "SELECT 'Solicitações: ' || COUNT(*) FROM service_requests;" | $PSQL -t -q | tr -d ' ')"
echo "$(echo "SELECT 'Propostas: ' || COUNT(*) FROM proposals;" | $PSQL -t -q | tr -d ' ')"
echo "$(echo "SELECT 'Avaliações: ' || COUNT(*) FROM reviews;" | $PSQL -t -q | tr -d ' ')"
echo "$(echo "SELECT 'Mensagens: ' || COUNT(*) FROM chat_messages;" | $PSQL -t -q | tr -d ' ')"
echo "$(echo "SELECT 'Favoritos: ' || COUNT(*) FROM favorites;" | $PSQL -t -q | tr -d ' ')"
echo ""
