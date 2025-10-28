// Deprecated: This route is no longer used because category creation uses a modal.
// Keep this file as a safe redirect to the main Categories page in case old links exist.
import { redirect } from 'next/navigation'

export default function DeprecatedNewCategoryPage() {
  redirect('/categories')
}
