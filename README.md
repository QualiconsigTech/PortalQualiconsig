# Portal Qualiconsig

Sistema interno de gestão de chamados desenvolvido para a Qualiconsig.

## 📚 Descrição

O Portal Qualiconsig é um sistema Web responsável pela abertura, gestão e acompanhamento de chamados entre usuários e analistas de suporte, dividido em backend (API REST) e frontend (painel).

O projeto atualmente está dividido em:
- **Backend:** Django + Django Rest Framework + PostgreSQL
- **Frontend:** Next.js (React) + Tailwind CSS

---

## 📂 Estrutura de Pastas

```
PortalQualiconsig/
├── backend/         # Serviço de API (Django)
│   ├── auth/
│   ├── chamados/
│   ├── users/
│   ├── config/   # Configurações do projeto
│   └── manage.py
├── frontend/        # Painel de acesso (Next.js)
│   ├── src/
│       ├── components/
│       ├── layouts/
│       ├── pages/
│       ├── services/
│       ├── types/
│       └── utils/
└── README.md
```

---

## 🚀 Principais Funcionalidades

- Cadastro de chamados
- Atribuição de chamados para analistas
- Atualização de status dos chamados: "Aberto", "Em Atendimento", "Encerrado"
- Upload e download de arquivos (base64)
- Categorias, Setores e Prioridades de chamados
- Notificação interna de alterações de status
- Controle de permissões de usuários e analistas
- Dashboard de gestão e filtros dinâmicos
- Autenticação via JWT

---

## 🔧 Tecnologias Utilizadas

### Backend
- Python 3.11+
- Django 4+
- Django Rest Framework
- PostgreSQL
- SimpleJWT para autenticação
- Docker (opcional)

### Frontend
- React 18
- Next.js 15+
- TailwindCSS
- React Hook Form + Zod
- Axios (para chamadas de API)

---

## 🔄 Como rodar o projeto localmente

### 1. Clonar o repositório
```bash
$ git clone https://github.com/seuusuario/PortalQualiconsig.git
$ cd PortalQualiconsig
```

### 2. Backend (Django)

```bash
$ cd backend
$ python -m venv venv
$ venv\Scripts\activate      

$ pip install -r requirements.txt

# Configure o .env e o banco de dados PostgreSQL
$ python manage.py migrate
$ python manage.py runserver
```

### 3. Frontend (Next.js)

```bash
$ cd frontend
$ npm install
$ npm run dev
```

Acesse o sistema via: [http://localhost:3000](http://localhost:3000)

---

## 🔢 Banco de Dados

O projeto utiliza PostgreSQL.

Principais tabelas:
- `users_usuario`
- `chamados_chamado`
- `users_categoria`
- `users_setor`
- `users_prioridade`
- `chamados_perguntafrequente`

---



## Documentação Projeto
https://www.notion.so/Portal-de-Chamados-1bac31d9667d80158b69c2dd6473bd11?pvs=4

## História Projeto
https://www.notion.so/Hist-ria-PortalQuali-1bdc31d9667d8061b94aedbb39f5c16c?pvs=4

## Figma Projeto
[https://www.figma.com/design/tircqXbIqHRbm32UeLLfh/Qualiconsig?node-id=0-1&p=ft-9JNfwg3qSOKrgnDY&mode=dev](https://www.figma.com/design/t1rczqXbIqHRbm32UeLLfh/Qualiconsig?node-id=0-1&t=yPCtdUMgSEzz5kmR-1)


## Postman 
[PortalQuali.postman_collection.json](https://github.com/user-attachments/files/19707817/PortalQuali.postman_collection.json)



