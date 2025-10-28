// Deprecated: This route is no longer used because new transactions are created via a modal.
// Keep this file as a safe redirect to the main Transactions page in case old links exist.
import { redirect } from 'next/navigation'

export default function DeprecatedNewTransactionPage() {
  redirect('/transactions')
}
