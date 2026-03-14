# AI Testing Platform

Nền tảng quản lý test case + AI tự động sinh test case, code, và chạy manual test bằng ngôn ngữ tự nhiên.

## Tech Stack

- **Frontend**: Next.js 14, TailwindCSS, Zustand, Socket.io-client
- **Backend**: Node.js, Express, Prisma, Socket.io
- **AI**: Google Gemini API
- **Browser Automation**: Playwright

---

## Setup

### 1. Lấy Gemini API Key (miễn phí)
1. Vào https://aistudio.google.com
2. Đăng nhập Google → Click "Get API key" → "Create API key"
3. Copy key dạng `AIzaSy...`

### 2. Tạo Database (Supabase miễn phí)
1. Vào https://supabase.com → New project
2. Copy Connection string từ Settings → Database

### 3. Setup Backend
```bash
cd backend
npm install
npx playwright install chromium

# Tạo file .env và điền thông tin
cp .env.example .env
# Điền GEMINI_API_KEY và DATABASE_URL

# Migrate database
npx prisma db push

# Chạy dev server
npm run dev
```

### 4. Setup Frontend
```bash
cd frontend
npm install

# Tạo file .env.local
cp .env.example .env.local

# Chạy dev
npm run dev
```

---

## API Endpoints

### Auth
- `POST /api/auth/register` — Đăng ký
- `POST /api/auth/login` — Đăng nhập
- `GET  /api/auth/me` — Thông tin user

### Projects
- `GET    /api/projects` — Danh sách project
- `POST   /api/projects` — Tạo project
- `GET    /api/projects/:id` — Chi tiết project
- `PUT    /api/projects/:id` — Cập nhật
- `DELETE /api/projects/:id` — Xóa

### Test Cases
- `GET  /api/testcases/project/:projectId` — Danh sách test case
- `POST /api/testcases` — Tạo test case
- `POST /api/testcases/bulk` — Tạo nhiều cùng lúc (dùng cho AI)
- `PUT  /api/testcases/:id` — Cập nhật
- `DELETE /api/testcases/:id` — Xóa

### AI
- `POST /api/ai/generate-testcases` — AI tạo test case từ mô tả
- `POST /api/ai/generate-code` — AI tạo Playwright code
- `POST /api/ai/manual-agent` — AI chạy manual test từ lệnh tự nhiên
- `POST /api/ai/analyze-bug` — AI phân tích bug từ screenshot

### Runner
- `POST /api/runner/start` — Chạy test run
- `GET  /api/runner/:runId` — Kết quả test run
