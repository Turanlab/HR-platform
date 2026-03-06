# HR Platform — Complete README

> ✅ **Hazır! (Ready!)** — Backend starts cleanly, frontend builds successfully. All 57 API endpoints verified.

## 📁 Project Structure

```
HR-platform/
├── backend/                  # Node.js + Express API
│   ├── config/               # Database connection
│   ├── controllers/          # 10 controller files (57 endpoints)
│   ├── middleware/           # auth, errorHandler, upload, payment
│   ├── models/               # 10 database models
│   ├── routes/               # 10 route files
│   ├── utils/                # aiService, pdfParser, emailService
│   ├── uploads/              # CV file storage (runtime)
│   ├── server.js             # Express + Socket.io entry point
│   └── .env.example          # Environment variable template
├── frontend/                 # React (CRA) application
│   └── src/
│       ├── components/       # 9 reusable UI components
│       ├── contexts/         # AuthContext
│       ├── pages/            # 6 main pages + 6 admin pages
│       ├── services/         # api.js, socket.js
│       └── store/            # Zustand stores (auth, messages)
├── database.sql              # PostgreSQL schema + 20 CV template seeds
└── deployment-guide.md       # Deployment notes
```

## ✅ Features Implemented

| Feature | Status |
|---|---|
| JWT Authentication (register/login) | ✅ Ready |
| Candidate CRUD with advanced search | ✅ Ready |
| CV file upload (PDF/DOCX, bulk) | ✅ Ready |
| CV Builder (structured data, 20+ templates) | ✅ Ready |
| AI Integration (OpenAI GPT-4) | ✅ Ready (mock fallback if no API key) |
| Real-time Messaging (Socket.io) | ✅ Ready |
| Company Portal + Candidate Search | ✅ Ready |
| Subscription Management (Stripe-ready) | ✅ Ready (stub if no Stripe key) |
| Admin Panel (users, CVs, audit logs) | ✅ Ready |
| Email Notifications (nodemailer) | ✅ Ready (stub if no SMTP config) |

## 🔧 Requirements

- **Node.js** 18+ 
- **PostgreSQL** 13+
- npm

## 🗄️ Database Setup

```bash
# Create database
psql -U postgres -c "CREATE DATABASE hr_platform;"

# Apply schema (creates all 12 tables + seeds 20 CV templates)
psql -U postgres -d hr_platform -f database.sql
```

**Tables created:** `users`, `candidates`, `cvs`, `jobs`, `audit_logs`, `cv_templates`, `user_cvs`, `company_profiles`, `messages`, `conversations`, `ai_logs`, `subscriptions`

**Default admin account:** `admin@hrplatform.com` / `Admin@1234`

## ⚙️ Environment Variables

Copy and configure:

```bash
cp backend/.env.example backend/.env
```

Key variables in `backend/.env`:

```env
# Required
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hr_platform
DB_USER=postgres
DB_PASSWORD=yourpassword
JWT_SECRET=your_super_secret_key_here

# Optional — AI features work with mock data if not set
OPENAI_API_KEY=sk-...

# Optional — Stripe stubs return mock responses if not set
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional — Email sends silently fail if not set
SMTP_HOST=smtp.gmail.com
SMTP_USER=you@gmail.com
SMTP_PASS=your_app_password
```

## 🚀 Running the Application

### Backend

```bash
cd backend
npm install
npm start          # production
# or
npm run dev        # development (nodemon auto-reload)
```

Backend runs at: **http://localhost:3001**

### Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs at: **http://localhost:3000**

## 🌐 API Endpoints (57 total)

### Auth (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register new user |
| POST | `/login` | Login, returns JWT |
| GET | `/check-email` | Check email availability |
| GET | `/me` | Get current user |

### CV Upload (`/api/cvs`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/upload` | Upload single CV (PDF/DOCX) |
| POST | `/bulk-upload` | Upload up to 50 CVs at once |
| GET | `/` | List all CVs (paginated) |
| DELETE | `/:id` | Delete CV |
| GET | `/:id/download` | Download CV file |

### CV Builder (`/api/cv-builder`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Create new structured CV |
| GET | `/` | Get user's CVs |
| GET | `/:id` | Get specific CV |
| PUT | `/:id` | Update CV data |
| DELETE | `/:id` | Delete CV |
| POST | `/:id/export` | Export CV as HTML/PDF |
| POST | `/:id/duplicate` | Duplicate CV |

### Templates (`/api/templates`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List templates (free/premium filter) |
| GET | `/:id` | Get template |
| POST | `/` | Create template (admin) |
| PUT | `/:id` | Update template (admin) |
| DELETE | `/:id` | Delete template (admin) |

### AI Features (`/api/ai`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/parse-cv` | Parse CV text with AI |
| POST | `/check-grammar` | Grammar check |
| POST | `/suggest-improvements` | CV improvement suggestions |
| POST | `/generate-cover-letter` | Generate cover letter |
| POST | `/extract-skills` | Extract skills from text |
| POST | `/ats-score` | ATS compatibility score |
| POST | `/match-job` | Match CV to job description |
| GET | `/logs` | AI usage logs (admin) |

### Companies (`/api/companies`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Create company profile |
| GET | `/` | List all companies (admin) |
| GET | `/search/candidates` | Search candidates (with filters) |
| GET | `/:id` | Get company |
| PUT | `/:id` | Update company |
| GET | `/:id/analytics` | Company analytics |

### Messages (`/api/messages`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/conversations` | List conversations |
| GET | `/conversations/:id` | Get messages |
| POST | `/` | Send message |
| PUT | `/conversations/:id/read` | Mark as read |
| DELETE | `/conversations/:id` | Delete conversation |

### Subscriptions (`/api/subscriptions`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/plans` | List pricing plans |
| GET | `/current` | Get current subscription |
| POST | `/checkout` | Create Stripe checkout session |
| POST | `/cancel` | Cancel subscription |
| POST | `/webhook` | Stripe webhook handler |
| GET | `/history` | Subscription history |

### Candidates (`/api/candidates`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List/search candidates |
| POST | `/` | Create candidate |
| GET | `/:id` | Get candidate |
| PUT | `/:id` | Update candidate |
| DELETE | `/:id` | Delete candidate |

### Admin (`/api/admin`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/stats` | Platform statistics |
| GET | `/users` | List users |
| POST | `/users` | Create user |
| PATCH | `/users/:id/role` | Update user role |
| DELETE | `/users/:id` | Delete user |
| GET | `/audit-logs` | Audit log |

## 💰 Pricing Tiers

### Candidates
| Plan | Price | Features |
|---|---|---|
| Free | $0 | 1 template, basic upload |
| Premium | $9.99/mo | 20+ templates, AI suggestions |
| Professional | $19.99/mo | Everything + analytics |

### Companies
| Plan | Price | Features |
|---|---|---|
| Starter | $99/mo | 50 CV searches/month |
| Professional | $199/mo | Unlimited + messaging |
| Enterprise | $499/mo | API access + dedicated support |

## 🎨 Frontend Pages

| Route | Page | Access |
|---|---|---|
| `/` | Home (landing page) | Public |
| `/register` | Register | Public |
| `/login` | Login | Public |
| `/pricing` | Pricing | Public |
| `/cv-builder` | CV Builder (3-panel: form + preview + AI) | Protected |
| `/templates` | Template Gallery (20+ designs) | Protected |
| `/company/dashboard` | Company Portal + Candidate Search | Protected |
| `/messages` | Real-time Messaging | Protected |
| `/profile` | User Profile + Subscription | Protected |
| `/admin/dashboard` | Admin Dashboard | Protected (admin) |
| `/admin/cvs` | CV Management | Protected (admin) |
| `/admin/candidates` | Candidate Management | Protected (admin) |
| `/admin/users` | User Management | Protected (admin) |
| `/admin/audit-logs` | Audit Logs | Protected (admin) |

## 🔌 Real-time (Socket.io)

The backend exposes a Socket.io server (same port as HTTP). Clients authenticate via JWT:

```js
// Client connection
const socket = io('http://localhost:3001', {
  auth: { token: localStorage.getItem('token') }
});

// Events
socket.on('new_message', (data) => { /* ... */ });
socket.on('user_online', ({ user_id }) => { /* ... */ });
socket.on('message_read', ({ conversation_id }) => { /* ... */ });
```

## 📝 Notes

- All AI endpoints return **mock/demo data** if `OPENAI_API_KEY` is not set — the app is fully functional without it.
- All Stripe endpoints return **stub responses** if `STRIPE_SECRET_KEY` is not set.
- Email notifications **silently fail** if SMTP is not configured.
- Frontend uses React CRA — run `npm run build` to create a production bundle.
- Default role for new self-registered users is `candidate`. Staff accounts should be created by an admin.
