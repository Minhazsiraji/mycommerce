"use client"

import { useMemo, useState } from 'react'

type Product = {
  id: string
  name: string
  animal: string
  size: string
  price: number
  description: string
  badge: string
  accent: string
  icon: string
}

const PRODUCTS: Product[] = [
  {
    id: 'layer-mash',
    name: 'Layer Mash',
    animal: 'Poultry · Layers',
    size: '25 kg bag',
    price: 18500,
    description: 'High-calcium organic feed for consistent laying and stronger shells.',
    badge: 'In stock',
    accent: '#e0b64a',
    icon: '🥚',
  },
  {
    id: 'broiler-starter',
    name: 'Broiler Starter',
    animal: 'Poultry · Broilers',
    size: '25 kg bag',
    price: 19200,
    description: 'High-protein blend made for healthy growth and efficient feed conversion.',
    badge: 'In stock',
    accent: '#cf7b45',
    icon: '🐔',
  },
  {
    id: 'dairy-meal',
    name: 'Dairy Meal',
    animal: 'Cattle',
    size: '50 kg bag',
    price: 32000,
    description: 'Energy-dense concentrate with balanced minerals for productive dairy cows.',
    badge: 'Low stock',
    accent: '#4d8ba8',
    icon: '🐄',
  },
  {
    id: 'pig-grower',
    name: 'Pig Grower',
    animal: 'Swine',
    size: '25 kg bag',
    price: 17800,
    description: 'Locally sourced grower feed formulated for lean, efficient weight gain.',
    badge: 'In stock',
    accent: '#b86d75',
    icon: '🐖',
  },
]

const provinces = ['Eastern Province', 'Kigali City', 'Northern Province', 'Southern Province', 'Western Province']

function money(value: number) {
  return `RWF ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)}`
}

function FeedBag({ product }: { product: Product }) {
  return (
    <div className="relative mx-auto flex h-52 w-40 items-center justify-center">
      <div
        className="absolute inset-x-3 bottom-1 top-3 rounded-[2rem_2rem_1.2rem_1.2rem] border border-black/10 shadow-[0_22px_50px_rgba(20,50,28,0.18)]"
        style={{ background: `linear-gradient(160deg, #f7f1dc 0%, #efe2ba 64%, ${product.accent} 180%)` }}
      />
      <div className="absolute inset-x-5 top-7 h-2 rounded-full bg-black/10" />
      <div className="relative z-10 mt-4 w-28 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#1e5b39] text-xl shadow-sm">
          {product.icon}
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#1e5b39]">Kountry Feed</p>
        <p className="mt-2 text-lg font-black leading-tight text-[#173d29]">{product.name}</p>
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#735f33]">100% Organic</p>
        <div className="mx-auto mt-3 h-px w-16 bg-[#1e5b39]/25" />
        <p className="mt-3 text-xs font-bold text-[#173d29]">{product.size}</p>
      </div>
    </div>
  )
}

export function KountryFeedDemo() {
  const [cart, setCart] = useState<Record<string, number>>({})
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [province, setProvince] = useState('Eastern Province')
  const [payment, setPayment] = useState('MTN Mobile Money')

  const cartItems = useMemo(
    () => PRODUCTS.map((product) => ({ ...product, qty: cart[product.id] ?? 0 })).filter((item) => item.qty > 0),
    [cart],
  )
  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0)
  const subtotal = cartItems.reduce((sum, item) => sum + item.qty * item.price, 0)

  function add(productId: string) {
    setCart((current) => ({ ...current, [productId]: (current[productId] || 0) + 1 }))
    setCartOpen(true)
  }

  function change(productId: string, delta: number) {
    setCart((current) => {
      const next = Math.max(0, (current[productId] || 0) + delta)
      return { ...current, [productId]: next }
    })
  }

  const orderText = encodeURIComponent(
    `Hello Kountry Feed, I would like to place this order:\n${cartItems
      .map((item) => `• ${item.name} (${item.size}) × ${item.qty} — ${money(item.price * item.qty)}`)
      .join('\n')}\n\nSubtotal: ${money(subtotal)}\nDelivery: ${province}\nPreferred payment: ${payment}`,
  )
  const whatsappHref = `https://wa.me/250787391260?text=${orderText}`

  return (
    <main className="min-h-dvh bg-[#f6f3e9] text-[#173d29]">
      <div className="bg-[#123924] px-4 py-2 text-center text-xs font-semibold tracking-wide text-white/85">
        Personalized sales concept · Demo only · No payment is processed
      </div>

      <header className="sticky top-0 z-30 border-b border-[#173d29]/10 bg-[#f6f3e9]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1e5b39] text-sm font-black text-[#f7e7a9] shadow-sm">KF</div>
            <div>
              <p className="text-lg font-black tracking-tight">Kountry Feed</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#4f705d]">Organic feed · Rwanda</p>
            </div>
          </div>
          <nav className="hidden items-center gap-7 text-sm font-semibold md:flex">
            <a href="#products" className="hover:text-[#2b7a4b]">Products</a>
            <a href="#why" className="hover:text-[#2b7a4b]">Why organic</a>
            <a href="#delivery" className="hover:text-[#2b7a4b]">Delivery</a>
          </nav>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative rounded-full bg-[#173d29] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5"
          >
            Cart · {cartCount}
          </button>
        </div>
      </header>

      <section className="overflow-hidden border-b border-[#173d29]/10">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-[#2b7a4b]/20 bg-white/55 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[#2b6a45]">
              <span>🇷🇼</span> 100% Organic · Made in Rwanda
            </div>
            <h1 className="max-w-3xl text-5xl font-black leading-[0.96] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Better feed.<br />Easier ordering.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#4a6756]">
              Browse Kountry Feed products, compare pack sizes and prices, build your order, then keep the final conversation on WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#products" className="rounded-full bg-[#1e5b39] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#1e5b39]/15">
                Shop feed products
              </a>
              <a href="https://wa.me/250787391260" target="_blank" rel="noreferrer" className="rounded-full border border-[#173d29]/20 bg-white/70 px-6 py-3.5 text-sm font-bold">
                WhatsApp sales ↗
              </a>
            </div>
            <div className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ['5', 'Feed types'],
                ['5', 'Provinces'],
                ['100%', 'Organic inputs'],
                ['1–3 days', 'Typical delivery'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-[#173d29]/10 bg-white/55 px-4 py-4">
                  <p className="text-xl font-black">{value}</p>
                  <p className="mt-1 text-xs font-semibold text-[#698071]">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[440px] overflow-hidden rounded-[2.5rem] bg-[#173d29] p-7 text-white shadow-[0_30px_80px_rgba(23,61,41,0.25)]">
            <div className="absolute -right-20 -top-16 h-64 w-64 rounded-full bg-[#d5ad43]/25 blur-2xl" />
            <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[#5da978]/25 blur-2xl" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f4d678]">Farm to bag · every batch</p>
                <p className="mt-4 max-w-md text-3xl font-black leading-tight">Organic nutrition sourced from Rwandan smallholder farmers.</p>
              </div>
              <div className="my-8 grid grid-cols-2 gap-4">
                <div className="rounded-3xl bg-white/10 p-5 backdrop-blur">
                  <div className="text-4xl">🌽</div>
                  <p className="mt-6 text-sm font-bold">Local sourcing</p>
                  <p className="mt-1 text-xs leading-5 text-white/65">Maize, soya and sunflower sourced close to Rwamagana.</p>
                </div>
                <div className="rounded-3xl bg-white/10 p-5 backdrop-blur">
                  <div className="text-4xl">🌱</div>
                  <p className="mt-6 text-sm font-bold">No synthetic additives</p>
                  <p className="mt-1 text-xs leading-5 text-white/65">A clean organic positioning customers can understand immediately.</p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 px-5 py-4">
                <span className="text-sm font-semibold text-white/70">Production</span>
                <span className="text-sm font-black">Rwamagana · Eastern Province</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="products" className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#2b7a4b]">Shop by need</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.035em]">Organic feed products</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#62766a]">Published Kountry Feed pricing shown for this personalized concept demo. Delivery is confirmed by the sales team.</p>
        </div>

        <div className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {PRODUCTS.map((product) => (
            <article key={product.id} className="group overflow-hidden rounded-[2rem] border border-[#173d29]/10 bg-white/65 shadow-[0_12px_40px_rgba(22,57,36,0.06)] transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(22,57,36,0.12)]">
              <div className="bg-[linear-gradient(180deg,#eef1df_0%,#f7f1df_100%)] px-5 pt-5">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[#e7f2e8] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#287048]">{product.badge}</span>
                  <span className="text-xs font-semibold text-[#718274]">{product.animal}</span>
                </div>
                <FeedBag product={product} />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black">{product.name}</h3>
                    <p className="mt-1 text-xs font-semibold text-[#708174]">{product.size}</p>
                  </div>
                  <p className="text-right text-lg font-black text-[#1f7044]">{money(product.price)}</p>
                </div>
                <p className="mt-4 min-h-16 text-sm leading-6 text-[#66786c]">{product.description}</p>
                <button type="button" onClick={() => add(product.id)} className="mt-5 w-full rounded-full bg-[#173d29] px-5 py-3 text-sm font-black text-white transition group-hover:bg-[#1f7044]">
                  Add to order
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="why" className="border-y border-[#173d29]/10 bg-[#ede9d9]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-3 lg:px-8">
          {[
            ['01', 'Clear product selection', 'Customers can see the feed type, bag size, price and stock signal before starting a conversation.'],
            ['02', 'Structured cart', 'Instead of retyping product names and quantities, the customer builds a clean order in seconds.'],
            ['03', 'WhatsApp stays', 'The final order can still move into WhatsApp with the products, quantities, province and payment preference already written.'],
          ].map(([num, title, text]) => (
            <div key={num} className="rounded-[2rem] border border-[#173d29]/10 bg-[#f7f4e9] p-7">
              <p className="text-xs font-black tracking-[0.2em] text-[#2b7a4b]">{num}</p>
              <h3 className="mt-7 text-2xl font-black">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#63766a]">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="delivery" className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="rounded-[2.5rem] bg-[#173d29] p-7 text-white sm:p-10 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_.8fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#f4d678]">Nationwide delivery</p>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.035em]">From Rwamagana to farms across Rwanda.</h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/70">Eastern Province can often receive same or next-day delivery. Other provinces are typically served within 1–3 business days, with final delivery cost confirmed by Kountry Feed.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {provinces.map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 font-bold">✓ {item}</div>)}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#173d29]/10 px-5 py-8 text-center text-xs font-semibold text-[#6c7c71]">
        Personalized commerce concept for Kountry Feed · Built with AgentSiraji Commerce
      </footer>

      {cartOpen ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#0d2619]/40 backdrop-blur-sm" onMouseDown={(event) => { if (event.currentTarget === event.target) setCartOpen(false) }}>
          <aside className="flex h-full w-full max-w-md flex-col bg-[#fbf8ef] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#173d29]/10 px-6 py-5">
              <div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#2b7a4b]">Your order</p><h2 className="mt-1 text-2xl font-black">Cart · {cartCount} bags</h2></div>
              <button type="button" onClick={() => setCartOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#173d29]/15 text-xl">×</button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              {cartItems.length === 0 ? <div className="rounded-3xl border border-dashed border-[#173d29]/20 p-8 text-center text-sm text-[#68786d]">Your cart is empty. Add a feed product to build a sample order.</div> : cartItems.map((item) => (
                <div key={item.id} className="rounded-3xl border border-[#173d29]/10 bg-white p-4">
                  <div className="flex gap-4"><div className="flex h-16 w-14 items-center justify-center rounded-2xl bg-[#eef0dd] text-3xl">{item.icon}</div><div className="flex-1"><div className="flex justify-between gap-4"><div><p className="font-black">{item.name}</p><p className="mt-1 text-xs text-[#718075]">{item.size}</p></div><p className="font-black">{money(item.price * item.qty)}</p></div><div className="mt-4 flex items-center gap-2"><button type="button" onClick={() => change(item.id, -1)} className="h-8 w-8 rounded-full border border-[#173d29]/15 font-black">−</button><span className="min-w-7 text-center text-sm font-black">{item.qty}</span><button type="button" onClick={() => change(item.id, 1)} className="h-8 w-8 rounded-full border border-[#173d29]/15 font-black">+</button></div></div></div>
                </div>
              ))}
            </div>
            <div className="border-t border-[#173d29]/10 p-6">
              <div className="mb-4 flex items-center justify-between"><span className="text-sm font-semibold text-[#6a7a70]">Product subtotal</span><span className="text-xl font-black">{money(subtotal)}</span></div>
              <button type="button" disabled={!cartItems.length} onClick={() => { setCartOpen(false); setCheckoutOpen(true) }} className="w-full rounded-full bg-[#1e5b39] px-5 py-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40">Continue to order details</button>
            </div>
          </aside>
        </div>
      ) : null}

      {checkoutOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#0d2619]/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[2rem] bg-[#fbf8ef] p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#2b7a4b]">Structured WhatsApp order</p><h2 className="mt-2 text-3xl font-black">Finish the details</h2><p className="mt-2 text-sm leading-6 text-[#68786d]">This demo does not take payment. It prepares a complete order for the Kountry Feed sales team.</p></div><button type="button" onClick={() => setCheckoutOpen(false)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#173d29]/15 text-xl">×</button></div>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-bold">Delivery province<select value={province} onChange={(e) => setProvince(e.target.value)} className="mt-2 w-full rounded-2xl border border-[#173d29]/15 bg-white px-4 py-3 font-medium outline-none">{provinces.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="text-sm font-bold">Preferred payment<select value={payment} onChange={(e) => setPayment(e.target.value)} className="mt-2 w-full rounded-2xl border border-[#173d29]/15 bg-white px-4 py-3 font-medium outline-none"><option>MTN Mobile Money</option><option>Airtel Money</option><option>Bank transfer</option><option>Cash on delivery</option></select></label>
            </div>
            <div className="mt-6 rounded-3xl border border-[#173d29]/10 bg-white p-5"><div className="flex justify-between text-sm"><span className="font-semibold text-[#6a7a70]">{cartCount} bag(s)</span><span className="font-black">{money(subtotal)}</span></div><p className="mt-3 text-xs leading-5 text-[#738278]">Delivery fee and final stock are confirmed by Kountry Feed before payment.</p></div>
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="mt-6 flex w-full items-center justify-center rounded-full bg-[#22a559] px-5 py-4 text-sm font-black text-white shadow-lg shadow-[#22a559]/20">Send complete order to WhatsApp ↗</a>
            <button type="button" onClick={() => { setCheckoutOpen(false); setCartOpen(true) }} className="mt-3 w-full px-5 py-3 text-sm font-bold text-[#567063]">Back to cart</button>
          </div>
        </div>
      ) : null}
    </main>
  )
}
