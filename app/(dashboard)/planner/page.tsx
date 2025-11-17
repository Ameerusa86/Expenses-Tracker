import PlannerForm from '@/components/planner/planner-form'

export const dynamic = 'force-dynamic'

export default async function PlannerPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="space-y-8">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Payment Planner
            </h1>
            <p className="text-muted-foreground">
              Allocate your paycheck to cover due dates and reduce balances.
            </p>
          </div>
          <PlannerForm />
        </div>
      </div>
    </div>
  )
}
