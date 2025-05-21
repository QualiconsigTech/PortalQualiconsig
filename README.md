
# Portal Qualiconsig

Sistema interno de **gestão multidisciplinar** desenvolvido para a Qualiconsig, com estrutura voltada para suporte técnico, interação entre grupos e gerenciamento interno.

---

## 📚 Descrição

O Portal Qualiconsig permite que qualquer colaborador da organização abra chamados diretamente para o setor de Tecnologia, além de consultar perguntas frequentes, dashboards, Qlinks e muito mais. O sistema foi reestruturado para suportar múltiplos grupos (Tecnologia, Financeiro, Comercial, etc.), com perfis distintos (usuários, analistas e admins).

O projeto é dividido em:
- **Backend:** Django + DRF + PostgreSQL
- **Frontend:** Next.js (React) + Tailwind CSS

---

## 📂 Estrutura de Pastas

```
PortalQualiconsig/
├── backend/             # API (Django)
│   ├── auth/
│   ├── chamados/
│   ├── core/            # Modelos de Grupo, Setor, Cargo
│   ├── users/
│   └── manage.py
├── frontend/            # Painel de acesso (Next.js)
│   └── src/
│       ├── components/
│       │   ├── portalQuali/
│       │   │   ├── chamados/
│       │   │   ├── portalAnalista/
│       │   │   ├── portalUsuario/
│       │   │   ├── analistas/
│       │   │   └── usuarios/
│       ├── hooks/
│       ├── pages/
│       ├── services/
│       └── utils/
└── README.md
```

---

## 🚀 Principais Funcionalidades

- Abertura de chamados por qualquer grupo da empresa
- Atendimento de chamados por analistas de tecnologia
- Classificação por categoria, setor e prioridade
- Controle de permissões por tipo de usuário e grupo
- Dashboard com KPIs de chamados e setores
- Notificações em tempo real com status e ações rápidas
- Upload e download de arquivos base64
- Tela exclusiva para primeiro acesso e troca de senha
- Autenticação via JWT
- Modularização por perfil (usuário vs analista)

---

## 🔧 Tecnologias Utilizadas

### Backend
- Python 3.11+
- Django 4.x
- Django Rest Framework
- PostgreSQL
- Django SimpleJWT
- Docker (opcional)

### Frontend
- React 18
- Next.js 15+
- TailwindCSS
- React Hook Form + Zod
- Axios
- Zustand (gerenciamento global)

---

## 🔄 Como rodar o projeto localmente

### 1. Clonar o repositório

```bash
git clone https://github.com/seuusuario/PortalQualiconsig.git
cd PortalQualiconsig
```

### 2. Backend (Django)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # ou venv\Scripts\activate no Windows

pip install -r requirements.txt

# Configure o .env com suas variáveis
python manage.py migrate
python manage.py runserver
```

### 3. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 🔢 Banco de Dados

Tabelas principais:

- `auth_user`
- `core_grupo`
- `setor`
- `cargo`
- `usuarios_usuario`
- `usuarios_usuario_grupos`
- `chamados_chamado`
- `chamados_notificacao`
- `chamados_perguntafrequente`

---

## 📘 Documentação

- [📖 Documentação Geral (Notion)](https://www.notion.so/Portal-de-Chamados-1bac31d9667d80158b69c2dd6473bd11?pvs=4)
- [📚 História do Projeto](https://www.notion.so/Hist-ria-PortalQuali-1bdc31d9667d8061b94aedbb39f5c16c?pvs=4)
- [🎨 Protótipo Figma](https://www.figma.com/design/tircqXbIqHRbm32UeLLfh/Qualiconsig?node-id=0-1&p=ft-9JNfwg3qSOKrgnDY&mode=dev)

---

## 📌 Observações

> Este projeto está em produção ativa e em constante evolução. A arquitetura foi planejada para futura separação de microserviços, com foco em escalabilidade e manutenibilidade.
