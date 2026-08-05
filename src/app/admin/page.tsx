import { redirect } from 'next/navigation'

export default function AdminIndex() {
  // Orders are what needs attention daily; products change far less often.
  redirect('/admin/orders')
}
