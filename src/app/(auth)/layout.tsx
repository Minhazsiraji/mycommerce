export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="storefront-card px-6 py-8 sm:px-8">{children}</div>
    </main>
  )
}
