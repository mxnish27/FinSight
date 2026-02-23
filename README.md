# FinSight - Smart Personal Financial Tracker

![FinSight](https://img.shields.io/badge/FinSight-Financial%20Tracker-violet)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)

**Take Control of Your Money with Smart Insights**

FinSight is a modern, production-ready personal finance tracker that helps individuals and families manually track spending across multiple bank accounts, generate monthly insights, and visualize spending trends using AI-powered analytics.

## ✨ Features

- **Multi-Account Tracking** - Track spending across debit and credit cards
- **Visual Analytics** - Beautiful pie charts, bar graphs, and trend lines
- **AI-Powered Insights** - Get personalized financial recommendations using OpenAI
- **Family Ledger** - Track internal family transactions and settle balances
- **Monthly Reports** - Export CSV reports and generate AI summaries
- **Dark/Light Mode** - Modern UI with theme toggle
- **Responsive Design** - Works on desktop and mobile

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS 4
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Charts**: Recharts
- **Auth**: JWT-based authentication
- **AI**: OpenAI API (GPT-3.5-turbo)
- **UI Components**: Radix UI, Lucide Icons

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key (for AI insights)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finsight
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your values:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-super-secret-jwt-key-change-in-production"
   OPENAI_API_KEY="your-openai-api-key-here"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Initialize the database**
   ```bash
   npx prisma db push
   ```

5. **Seed demo data (optional)**
   ```bash
   npm run db:seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Credentials

If you ran the seed script:
- **Email**: demo@finsight.com
- **Password**: demo123

## 📁 Project Structure

```
finsight/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── seed.ts            # Demo data seed script
│   └── dev.db             # SQLite database (generated)
├── src/
│   ├── app/
│   │   ├── (auth)/        # Auth pages (login, register)
│   │   ├── (dashboard)/   # Dashboard pages
│   │   ├── api/           # API routes
│   │   ├── globals.css    # Global styles
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Landing page
│   ├── components/
│   │   ├── dashboard/     # Dashboard components
│   │   ├── ui/            # Reusable UI components
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   ├── hooks/
│   │   └── use-toast.ts   # Toast notifications
│   └── lib/
│       ├── auth.ts        # Authentication utilities
│       ├── openai.ts      # OpenAI integration
│       ├── prisma.ts      # Prisma client
│       └── utils.ts       # Utility functions
├── .env.example           # Environment variables template
├── package.json
└── README.md
```

## 🗄️ Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  accounts  Account[]
  transactions Transaction[]
  familyTransactions FamilyTransaction[]
}

model Account {
  id       String @id @default(cuid())
  name     String
  type     String // "DEBIT" or "CREDIT"
  balance  Float
  bankName String?
  transactions Transaction[]
}

model Transaction {
  id          String   @id @default(cuid())
  amount      Float
  type        String   // "DEBIT" or "CREDIT"
  category    String
  description String?
  merchant    String?
  date        DateTime
}

model FamilyTransaction {
  id         String   @id @default(cuid())
  fromPerson String
  toPerson   String
  amount     Float
  note       String?
  date       DateTime
}
```

## 🌐 API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |
| GET/POST | `/api/accounts` | List/Create accounts |
| PUT/DELETE | `/api/accounts/[id]` | Update/Delete account |
| GET/POST | `/api/transactions` | List/Create transactions |
| DELETE | `/api/transactions/[id]` | Delete transaction |
| GET/POST | `/api/family-transactions` | List/Create family transactions |
| DELETE | `/api/family-transactions/[id]` | Delete family transaction |
| GET | `/api/stats` | Get financial statistics |
| POST | `/api/insights` | Generate AI insights |

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

**Note**: For production, consider using a hosted database like:
- [Neon](https://neon.tech) (PostgreSQL)
- [PlanetScale](https://planetscale.com) (MySQL)
- [Supabase](https://supabase.com) (PostgreSQL)

Update your `prisma/schema.prisma` datasource accordingly.

### Environment Variables for Production

```env
DATABASE_URL="your-production-database-url"
JWT_SECRET="generate-a-strong-random-secret"
OPENAI_API_KEY="your-openai-api-key"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

## 🔐 Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- HTTP-only cookies for token storage
- API routes protected with auth middleware
- Environment variables for sensitive data

## 📝 Categories

The app supports the following expense categories:
- Food & Dining
- Shopping
- Travel
- EMI
- Utilities
- Entertainment
- Healthcare
- Education
- Family Transfer
- Groceries
- Fuel
- Rent
- Insurance
- Investment
- Salary
- Other Income
- Other

## 👨‍👩‍👧‍👦 Family Members

Default family members for the Family Ledger:
- Mummy
- Daddy
- Kedha
- Me

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ using Next.js, Prisma, and TailwindCSS
