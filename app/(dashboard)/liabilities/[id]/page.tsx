import { redirect } from 'next/navigation'

export default async function LegacyLiabilityDetailRedirect({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/credit-loans/${id}`)
}
