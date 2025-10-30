# ExpenseFlow

ExpenseFlow is a Next.js 16 (App Router) expense tracking SaaS using MongoDB (Mongoose) and Better Auth. This fork adds a Credit & Loans feature to track credit cards and loans, balances, and payments.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Key authenticated routes live under `app/(dashboard)/*`.

## Credit & Loans

Track credit cards and loans with current balance, credit limit, APR, minimum payment, and payment history.

- Pages
  - List: `/credit-loans`
  - Detail: `/credit-loans/[id]`

- Create/Update via Server Actions
  - Create credit/loan: `createLiability(input)` in `app/actions/liabilities.ts`
  - Add payment: `createLiabilityPayment(input)` in `app/actions/liability-payments.ts`

- Query via API
  - List: `GET /api/liabilities?type=credit-card|loan&page=1&limit=20`
  - Item: `GET /api/liabilities/[id]`

- Data model (Mongoose)
  - `models/Liability.ts`: `{ type: 'credit-card'|'loan', name, institution?, balanceCents, creditLimitCents?, interestRateAPR?, minPaymentCents?, statementDay?, dueDay?, nextDueDate?, lastPaymentDate?, status: 'open'|'closed', userId }`
  - `models/LiabilityPayment.ts`: `{ liabilityId, amountCents, date, notes?, userId }`

- UI Components (shadcn/ui)
  - `components/credit-loans/add-credit-loan-modal.tsx`
  - `components/credit-loans/add-payment-modal.tsx`

Notes

- Monetary values are stored as integer cents. Use `utils/money.ts` for conversions and formatting.
- Legacy routes `/liabilities` and `/liabilities/[id]` now redirect to `/credit-loans` equivalents.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
