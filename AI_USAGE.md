# AI Usage Policy & Documentation

This document outlines the usage of AI coding assistants, agents, and LLMs during the design, implementation, and refinement of the **KYB (Know Your Business) Onboarding System**.

---

## 1. AI Tools Used & Scope of Work

| AI Tool / Model | Scope of Work |
| :--- | :--- |
| **Antigravity AI (Agentic Assistant)** | - Rapid scaffolding of backend controllers, repositories, Prisma schemas, and migrations.<br>- Building frontend React components, Tailwind CSS v4 styling, review tables, and modals.<br>- Refactoring form field validation, custom primitives (`<FormField />`), and error state management.<br>- Architectural enhancements: global error handling middleware, unified response wrappers, and dependency injection wiring.<br>- Troubleshooting build and packaging issues (e.g., TypeScript Node16 native ESM migration). |
| **Google Gemini API (`@google/genai`)** | - Automated document analysis engine (`AIService`): processes business registration documents, cross-verifies applicant inputs against document findings, and calculates structured risk scores (0–100) and recommendations. |

---

## 2. Key Prompts and Instructions

Below are actual prompt instructions provided to the AI assistant throughout the project:

### A. Reviewer Dashboard & API Optimization
> *"Create a table component and pass application data into it, call API using useEffect. A reviewer can list applications and filter them by status, open an application, view details and the AI review result, and approve or reject it."*

> *"In backend, create `src/mappers`. Create a mapper function to map `getApplication` data so it only sends what the dashboard table needs. Then in frontend, call `/api/applications/:applicationId` to view detailed review findings."*

### B. UI/UX Polish & Tailwind CSS Design System
> *"Task: UI/UX Polish and Spacing Refinement. Please update the UI for our React components to ensure a modern, polished, and professional appearance using Tailwind CSS v4 without altering state or business logic. Apply generous internal padding (`p-6`/`p-8`), flex/grid gaps (`gap-4`/`gap-6`), soft edges (`rounded-2xl` for containers, `rounded-lg` for buttons/inputs), subtle borders and soft shadows, and clear interactive focus rings."*

### C. Frontend Validation & Component Reusability
> *"More than just validation, I need to polish my code to be readable and maintainable. Create `src/utils/validation.ts` with RFC email validation, build a reusable `FormField` component with accessible labels and field errors, validate file type and 10MB file size, and display file size and preview details cleanly."*

### D. Architectural Quality & Error Handling
> *"Implement a proper global error handling middleware in `src/middlewares`, pass errors through `next()`. Create a consistent response structure in `src/utils` with a helper passing `res`, `statusCode`, and spreading `success`, `message`, `data`, etc."*

---

## 3. Cases Where AI Output Was Suboptimal or Incorrect & How It Was Fixed

### Case 1: Controller Method Context Loss (`TypeError: Cannot read properties of undefined`)
- **The Issue**: When the AI implemented `ApplicationController` methods (`getApplications`, `getApplicationById`, `updateDecision`), it initially declared them as standard class methods (`async getApplications(req, res, next) { ... }`). When these methods were passed as detached callbacks in Express route definitions (`applicationRouter.get('/', applicationController.getApplications)`), `this` became `undefined` at runtime in strict mode, resulting in:
  ```text
  TypeError: Cannot read properties of undefined (reading '_applicationService')
  ```
- **How It Was Identified**: Triggered when testing the Reviewer Dashboard query `GET /api/applications?status=`.
- **The Fix**: Manually converted all controller methods into class arrow function properties (e.g. `getApplications = async (req, res, next) => { ... }`) and bound them in route definitions (`applicationController.getApplications.bind(applicationController)`), ensuring lexical binding of `this`.

---

### Case 2: TypeScript ESM vs. CommonJS Module Resolution (`TS1479`)
- **The Issue**: The `@google/genai` SDK is published as an ES module (`"type": "module"`). In the initial CommonJS configuration, TypeScript flagged:
  ```text
  error TS1479: The current file is a CommonJS module whose imports will produce 'require' calls; however, the referenced file is an ECMAScript module.
  ```
- **How It Was Identified**: Failed execution of `npm run build` during backend production compile checks.
- **The Fix**: Rather than suppressing the issue with hacks, we upgraded the backend to native Node16 ESM:
  1. Updated `package.json` to `"type": "module"`.
  2. Set `"module": "Node16"` and `"moduleResolution": "Node16"` in `tsconfig.json`.
  3. Added explicit `.js` extensions across all internal relative imports across routes, services, repositories, and controllers.

---

### Case 3: Blocking Synchronous AI Review During Application Submission
- **The Issue**: The initial implementation executed the Gemini AI document verification inline during the `POST /api/applications` submission endpoint. Because document upload to Cloudinary plus Gemini multimodal processing can take 4–10 seconds, the client request hung with a long loading spinner, degrading user experience.
- **How It Was Identified**: Code review of `ApplicationService.submitApplication` revealed latency bottlenecks and potential timeout risks on cloud serverless deployments.
- **The Fix**: Decoupled the submission flow:
  1. `submitApplication` immediately saves the application record with status `SUBMITTED` and responds with `201 Created` in < 500ms.
  2. The AI verification triggers asynchronously in the background (`processAiReviewInBackground`), updating the status to `AI_REVIEWED` or `AI_REVIEW_FAILED` upon completion.
  3. The frontend displays an informative **"Application Under Review"** status with auto-refresh/status polling feedback.

---

### Case 4: Heavy Payload in Applications Table Listing
- **The Issue**: The initial table API query returned the full database entity, including detailed verification findings and document links for dozens of applications at once.
- **How It Was Identified**: Reviewing network payloads on the Reviewer Dashboard.
- **The Fix**: Implemented a dedicated Data Transfer Object (DTO) mapper (`toApplicationTableDTOs` in `backend/src/mappers/application.mapper.ts`) to only send summary fields needed for the table view (ID, applicant name, business name, status, risk score, date), deferring detailed document and AI findings inspection to on-demand `/api/applications/:id` modal requests.

---

## 4. Work Performed or Reviewed Manually

While AI tools expedited repetitive coding, significant architectural decisions and safeguards were written or audited manually:

1. **Single Responsibility Principle (SRP) Refactoring**:
   - Decoupled `TokenService` (access & refresh token generation/verification) and `cookieUtils` (HTTP-only cookie security) out of `AuthService` and `AuthController` to ensure clean separation of concerns.

2. **Security & Cookie Policies**:
   - Manually audited refresh token cookie configurations (`httpOnly: true`, `secure: process.env.NODE_ENV === 'production'`, `sameSite: 'lax' / 'none'`) to guard against XSS and CSRF token theft.

3. **Prompt Engineering & Hallucination Prevention**:
   - Manually tuned the system prompt in `backend/src/utils/aiUtils.ts` to enforce deterministic, strictly valid JSON output, schema validation, and risk score boundaries (0–100) mapped to business tiers (`LOW`, `MEDIUM`, `HIGH`).

4. **Environment & Secrets Guarding**:
   - Audited `.env.example` to ensure no sensitive credentials (Cloudinary API secrets, Gemini keys, database passwords) were committed, and implemented runtime validation guards in `token.service.ts` to prevent running with missing JWT secrets.

5. **Branching & Release Hygiene**:
   - Enforced Git Feature Branch workflow (`feature/*` / `refactor/*` / `chore/*` → `dev` → `main`) with clean merge commits and working tree verification before pushing to production.
