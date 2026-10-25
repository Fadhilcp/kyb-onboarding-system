# KYB (Know Your Business) Onboarding System

A modern, production-grade, full-stack **Business Onboarding (KYB) and Compliance Review Portal** built with **React 19**, **Node.js (ESM)**, **TypeScript**, **PostgreSQL**, **Prisma**, and **Google Gemini AI**.

The platform automates the verification of corporate registration documents, calculates AI-assisted compliance risk scores, and provides human compliance officers with a sleek reviewer dashboard to approve or reject applications.

---

## 🌟 Key Features

### 1. Applicant Onboarding Portal
- **Multi-Step Form**: Step-by-step onboarding flow (**1. Business Details → 2. Document Upload → 3. Confirmation & Review**).
- **Client-Side Validation**: Immediate, accessible field-level error feedback (RFC email validation, non-empty legal entity checks, date validation, and name constraints).
- **Document Uploader**: Drag-and-drop document upload with real-time thumbnail preview for images and PDF badges, enforcing allowed formats (PDF, JPEG, PNG, WebP) and 10MB file size limits.
- **Background Processing UX**: Instant submission feedback with an **"Application Under Review"** status screen while AI document cross-verification executes asynchronously.

### 2. Automated AI Verification Engine (Google Gemini)
- **Document Information Extraction**: Extracts official entity names, registration numbers, incorporation dates, and director names directly from uploaded PDFs or certificate images.
- **Cross-Verification**: Compares submitted applicant details against extracted document findings to detect mismatches or fraudulent alterations.
- **Risk Assessment**: Outputs a granular risk score (0–100), risk tier (`LOW`, `MEDIUM`, `HIGH`), and verification findings.
- **Decoupled Architecture**: Asynchronous background execution (`processAiReviewInBackground`) ensures applicant submissions never time out or hang.

### 3. Reviewer & Compliance Dashboard
- **Status Filtering**: Filter applications across `ALL`, `SUBMITTED`, `AI_REVIEWED`, `AI_REVIEW_FAILED`, `APPROVED`, and `REJECTED`.
- **Lightweight Table**: Uses backend DTO mappers (`toApplicationTableDTOs`) to stream minimal payloads for fast rendering.
- **Inspection Modal**: Comprehensive detail view displaying entity metadata, direct document preview, and AI verification findings side-by-side.
- **Reviewer Decisions**: Reviewers can approve or reject applications with optimistic updates, instant badge refresh, and persistent database audit tracking.

### 4. Enterprise Security & Architecture
- **JWT Authentication**: Short-lived access tokens paired with secure HTTP-only refresh cookies (`SameSite`, `Secure`, `HttpOnly`).
- **Single Responsibility Principle (SRP)**: Dedicated `TokenService`, `cookieUtils`, and repository abstractions.
- **Global Error Handling**: Centralized `errorHandler` middleware capturing Zod validation errors, Multer upload errors, and custom `AppError` exceptions into unified `{ success, error, details }` payloads.
- **Full TypeScript Native ESM**: Modern Node16 native ES module architecture across both backend and frontend.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Vite, Redux Toolkit, Axios, React Router v7 |
| **Backend** | Node.js (Node16 Native ESM), Express 5, TypeScript, Prisma ORM |
| **Database** | PostgreSQL |
| **AI / Multimodal** | Google Gemini API (`@google/genai`) |
| **Media Storage** | Cloudinary & Multer |
| **Deployment** | Vercel (Frontend SPA with `vercel.json` rewrites) |

---

## 📂 Project Structure

```text
kyb-onboarding-system/
├── AI_USAGE.md                 # AI usage policy and prompt/refactoring documentation
├── README.md                   # Project overview, architecture, and setup instructions
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database models (User, Application, ReviewResult)
│   │   ├── seed.ts             # Reviewer admin seeding script
│   │   └── migrations/         # Prisma migration history
│   ├── src/
│   │   ├── config/             # Cloudinary, Gemini, Multer, and Prisma client configs
│   │   ├── controllers/        # ApplicationController, AuthController
│   │   ├── dtos/               # TypeScript DTOs for requests and responses
│   │   ├── mappers/            # Response mappers (toApplicationTableDTOs)
│   │   ├── middlewares/        # auth, checkRole, and global errorHandler middlewares
│   │   ├── repositories/       # Data access layer (User, Application)
│   │   ├── routes/             # authRouter, applicationRouter
│   │   ├── services/           # ApplicationService, AuthService, TokenService, AIService
│   │   ├── utils/              # response.ts, appError.ts, cookieUtils.ts, aiUtils.ts
│   │   ├── app.ts              # Express application setup
│   │   └── server.ts           # Server bootstrap
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── components/         # DetailsStep, DocumentStep, ReviewStep, ApplicationsTable, Modal
    │   │   └── common/         # Reusable FormField primitive
    │   ├── features/           # Redux Toolkit auth slice
    │   ├── pages/              # SubmitApplicationPage, AdminLoginPage, AdminDashboardPage
    │   ├── routes/             # ProtectedRoute, PublicRoute
    │   ├── services/           # applicationService, authService
    │   ├── store/              # Redux store configuration
    │   └── utils/              # validation.ts, tokenStore.ts
    ├── vercel.json             # SPA client-side rewrite rules
    ├── package.json
    └── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v20+ recommended)
- **PostgreSQL** instance
- **Cloudinary** account (for document uploads)
- **Google Gemini API Key**

---

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Fill in the required values:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://user:password@localhost:5432/kyb_db?schema=public"
   JWT_ACCESS_SECRET="your_jwt_access_secret_key"
   JWT_REFRESH_SECRET="your_jwt_refresh_secret_key"
   CORS_ORIGIN="http://localhost:5173"
   CORS_METHODS="GET,POST,PUT,PATCH,DELETE,OPTIONS"
   CORS_ALLOWED_HEADERS="Content-Type,Authorization"
   CORS_CREDENTIALS=true
   CLOUDINARY_CLOUD_NAME="your_cloud_name"
   CLOUDINARY_API_KEY="your_cloudinary_key"
   CLOUDINARY_API_SECRET="your_cloudinary_secret"
   GEMINI_API_KEY="your_google_gemini_api_key"
   ```

4. **Run database migrations and seed the reviewer account**:
   ```bash
   npx prisma migrate dev --name init
   npm run seed
   ```
   *Default Reviewer Credentials:*
   - **Email**: `admin@kyb.com`
   - **Password**: `Admin@1234`

5. **Start the backend development server**:
   ```bash
   npm run dev
   ```
   The backend will start at `http://localhost:5000`.

---

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Ensure the API endpoint points to your backend:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the frontend development server**:
   ```bash
   npm run dev
   ```
   Access the application at `http://localhost:5173`.

---

## 📡 Core API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Reviewer sign-in with email & password | Public |
| `POST` | `/api/auth/refresh` | Refresh access token using HTTP-only cookie | Public |
| `POST` | `/api/auth/logout` | Revoke session and clear refresh cookie | Authenticated |

### Applications (`/api/applications`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/applications` | Submit KYB registration data and document | Public |
| `GET` | `/api/applications` | List applications with optional `?status=` filter | Reviewer |
| `GET` | `/api/applications/:id` | Fetch full application details & AI findings | Reviewer |
| `PATCH` | `/api/applications/:id/decision` | Approve or reject application (`{ status }`) | Reviewer |

---

## 🤖 AI Usage & Assistance Policy

In compliance with assignment guidelines, full documentation of AI assistant utilization, key prompts, edge cases identified and fixed, and manually audited components is documented in:

👉 **[AI_USAGE.md](./AI_USAGE.md)**

---

## 📄 License
This project is licensed under the [ISC License](LICENSE).
