import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Scroll Reveal Hook ────────────────────────────────────────────────────────
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, visible };
}

// ─── Animated Section Wrapper ─────────────────────────────────────────────────
const Reveal = ({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) => {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

// ─── Card Wrapper with hover ───────────────────────────────────────────────────
const HoverCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={cn("transition-all duration-300", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 12px 32px rgba(0,0,0,0.06)' : '0 2px 8px rgba(0,0,0,0.03)'
      }}
    >
      {children}
    </div>
  );
};

// ─── Desktop & Mobile Steps UI ────────────────────────────────────────────────
const StepsRow = () => {
  const steps = [
    { num: '1', title: 'Request Return', desc: 'Contact us within 7 days of delivery with order number and reason.' },
    { num: '2', title: 'Approval', desc: 'Our team reviews and confirms within 24 hours.' },
    { num: '3', title: 'Pickup', desc: 'A courier picks up the item from your address.' },
    { num: '4', title: 'Inspection', desc: 'We inspect the item (1–2 business days).' },
    { num: '5', title: 'Refund / Exchange', desc: 'Refund in 5–7 days or exchange dispatched in 2–3 days.' },
  ];

  return (
    <div className="relative">
      {/* Horizontal connecting line (hidden on mobile) */}
      <div className="hidden md:block absolute top-[28px] left-8 right-8 h-[1px] bg-brand-gold/30" />

      <div className="flex flex-col md:flex-row justify-between gap-10 md:gap-6 relative z-10">
        {steps.map((step, i) => (
          <Reveal key={step.num} delay={i * 100}>
            <HoverCard className="flex-1 bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/50 text-center relative h-full flex flex-col items-center group">
              <div className="w-14 h-14 rounded-full bg-[#C9A84C] border-2 border-[#C9A84C] flex items-center justify-center text-white font-serif text-xl font-bold mb-4 shadow-[0_0_15px_rgba(201,168,76,0.15)] group-hover:shadow-[0_0_25px_rgba(201,168,76,0.4)] transition-shadow duration-300">
                {step.num}
              </div>
              <h3 className="font-serif text-lg font-bold text-[#1E1C1A] mb-2">{step.title}</h3>
              <p className="text-sm text-[#8A8078] leading-relaxed max-w-[200px] mx-auto">{step.desc}</p>
            </HoverCard>
          </Reveal>
        ))}
      </div>
    </div>
  );
};

const ReturnsAndExchanges = () => {
  useEffect(() => {
    document.title = 'Returns & Exchanges | TAYFA';
  }, []);

  return (
    <div className="bg-white min-h-screen font-sans">


      <section
        style={{ background: '#2c2926', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")" }}
        className="w-full px-4 py-20 text-center"
      >
     
        <Reveal>
          <div className="flex justify-center mb-6">
            <div
              style={{ background: '#3A3520', border: '1px solid #C9A84C', borderRadius: '50%' }}
              className="w-16 h-16 flex items-center justify-center"
            >
              <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
            </div>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <h1 style={{ fontSize: 52, letterSpacing: '-0.5px', color: '#FFFFFF', fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 700, lineHeight: 1.15 }} className="mb-4">
            Returns &amp; Exchanges
          </h1>
        </Reveal>
<Reveal delay={160}>
  <p 
    style={{ color: '#B8B0A0', fontSize: 16, maxWidth: 540, lineHeight: 1.7 }} 
    className="mx-auto mb-8"
  >
    Easy, hassle-free returns within{' '}
    <span style={{ color: '#C9A84C', fontWeight: 600 }}>7 days</span>
    {' '}of delivery. Your satisfaction is our priority.
  </p>
</Reveal>

        {/* Thin gold divider
        <Reveal delay={200}>
          <div style={{ width: 120, height: 1, background: '#C9A84C', opacity: 0.2, margin: '0 auto 24px' }} />
        </Reveal> */}

        {/* Feature Pills */}
        <Reveal delay={240}>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {[
              { icon: '⏱', label: '7-Day Return Window' },
              { icon: '✓', label: 'Free Pickup (Defective Items)' },
              { icon: '💳', label: 'Refund to Original Payment' },
            ].map((pill) => (
              <span
                key={pill.label}
                style={{
                  border: '1px solid rgba(201,168,76,0.3)',
                  background: 'rgba(201,168,76,0.07)',
                  borderRadius: 999,
                  padding: '8px 18px',
                  color: '#D4CAB8',
                  fontSize: 13,
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span aria-hidden="true">{pill.icon}</span> {pill.label}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── STEP PROCESS SECTION ────────────────────────────────────────────── */}
      <section style={{ background: '#FFFFFF', padding: '80px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(201,168,76,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <Reveal>
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 32, color: '#1E1C1A', fontWeight: 700, margin: 0 }}>
                  How to Return an Item
                </h2>
              </div>
  
            </div>
          </Reveal>

          {/* Steps — Desktop: horizontal, Mobile: vertical */}
          <StepsRow />

        </div>
      </section>

      {/* ── SECTION 2: RETURN CONDITIONS ───────────────────────────────────── */}
      <section style={{ padding: '64px 0' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">

          <Reveal>
            <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 32, color: '#1E1C1A', borderLeft: '3px solid #C9A84C', paddingLeft: 14, marginBottom: 32 }}>
              Return Conditions
            </h2>
          </Reveal>

          {/* Two column cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14 items-stretch">
            {/* Eligible */}
            <Reveal delay={80} className="h-full">
              <HoverCard className="h-full">
                <div style={{ background: '#f0fdf4', border: '1px solid rgba(80,160,100,0.2)', borderRadius: 16, padding: 28, borderTop: '4px solid #3D9970', height: '100%' }}>
                  <div className="flex items-center gap-3 mb-5">
                    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3D9970" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 17, fontWeight: 600, color: '#1E1C1A' }}>Eligible for Return</span>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }} className="space-y-3">
                    {[
                      'Item must be unused, unworn, and unwashed',
                      'All original tags and labels must be attached',
                      'Item must be in its original packaging / brand box',
                      'All accessories, parts, and packaging materials must be included',
                      'Return must be initiated within 7 days of delivery',
                    ].map((item) => (
                      <li key={item} style={{ color: '#3D3530', fontSize: 14, lineHeight: 1.8, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <span style={{ color: '#3D9970', marginTop: 4, flexShrink: 0 }}>●</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </HoverCard>
            </Reveal>

            {/* Not Eligible */}
            <Reveal delay={160} className="h-full">
              <HoverCard className="h-full">
                <div style={{ background: '#FFF1F0', border: '1px solid rgba(200,70,60,0.2)', borderRadius: 16, padding: 28, borderTop: '4px solid #C8453C', height: '100%' }}>
                  <div className="flex items-center gap-3 mb-5">
                    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C8453C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    <span style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 17, fontWeight: 600, color: '#1E1C1A' }}>Not Eligible</span>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }} className="space-y-3">
                    {[
                      'Items that are worn, washed, or damaged by the customer',
                      'Items with missing or removed tags',
                      'Sale / clearance items (unless defective)',
                      'Items returned after the 7-day window',
                      'Innerwear and personal care items (hygiene reasons)',
                      'Customized or personalized products',
                    ].map((item) => (
                      <li key={item} style={{ color: '#3D3530', fontSize: 14, lineHeight: 1.8, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <span style={{ color: '#C8453C', marginTop: 4, flexShrink: 0 }}>●</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </HoverCard>
            </Reveal>
          </div>

          {/* QC Process Card */}
          <Reveal delay={240}>
            <HoverCard>
              <div style={{ background: '#f8f6f4', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 16, padding: '28px 32px' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div style={{ background: 'rgba(201,168,76,0.15)', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </div>
                    <span style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 17, color: '#1E1C1A', fontWeight: 600 }}>Quality Check (QC) Process</span>
                  </div>
                  <span style={{ background: 'rgba(201,168,76,0.15)', color: '#8B6914', fontSize: 12, fontWeight: 600, borderRadius: 999, padding: '4px 12px', whiteSpace: 'nowrap' }}>
                    1–2 Business Days
                  </span>
                </div>
                <p style={{ color: '#5A5248', fontSize: 15, lineHeight: 1.75, marginBottom: 16 }}>
                  Once your item is picked up, it goes through a thorough Quality Check at our facility. This ensures the item matches the return conditions stated above. The QC process takes 1–2 business days.
                </p>
                <div style={{ background: '#FEFAE8', borderLeft: '3px solid #C9A84C', borderRadius: '0 8px 8px 0', padding: '12px 16px' }}>
                  <p style={{ fontSize: 13, color: '#7A5C10', margin: 0, lineHeight: 1.6 }}>
                    <strong>Important:</strong> If an item fails QC (worn, damaged, missing tags), it will be returned to you and no refund will be issued. Your refund is only processed after successful QC approval.
                  </p>
                </div>
              </div>
            </HoverCard>
          </Reveal>
        </div>
      </section>

      {/* ── SECTION 3: REFUND TIMELINES ────────────────────────────────────── */}
      <section style={{ background: '#FFFFFF', padding: '64px 0 10px 0', marginBottom: '40px' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">

          <Reveal>
            <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 32, color: '#1E1C1A', borderLeft: '3px solid #C9A84C', paddingLeft: 14, marginBottom: 24 }}>
              Refund Timelines
            </h2>
          </Reveal>
          
          {/* Timeline Cards */}
          <div className="space-y-4 mb-7 bg-[#f8f6f4]">
            {[
              {
                icon: (
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                ),
                method: 'Debit / Credit Card',
                desc: 'Refunded directly to your bank account after QC approval.',
                duration: '5–7 business days',
              },
              {
                icon: (
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                ),
                method: 'JazzCash / Easypaisa',
                desc: 'Credited back to your mobile wallet.',
                duration: '3–5 business days',
              },
              {
                icon: (
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                ),
                method: 'Cash on Delivery (COD)',
                desc: 'Transferred to your registered bank account via IBFT.',
                duration: '7–10 business days',
              },
            ].map((card, i) => (
              <Reveal key={card.method} delay={80 + i * 80}>
                <HoverCard>
                  <div
                    style={{ background: '#FFFFFF', border: '1px solid #EAE5DC', borderRadius: 14, padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}
                  >
                    <div className="flex items-center gap-4">
                      <div style={{ color: '#C9A84C', flexShrink: 0 }}>{card.icon}</div>
                      <div>
                        <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 15, fontWeight: 600, color: '#1E1C1A', margin: 0 }}>{card.method}</p>
                        <p style={{ fontSize: 13, color: '#8A8078', margin: '2px 0 0' }}>{card.desc}</p>
                      </div>
                    </div>
                    <span style={{ background: '#F5EDD5', color: '#7A5C10', borderRadius: 999, padding: '6px 14px', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {card.duration}
                    </span>
                  </div>
                </HoverCard>
              </Reveal>
            ))}
          </div>

          {/* Footer Note */}
          <Reveal delay={320}>
            <p style={{ textAlign: 'center', fontSize: 12, color: '#A09890', fontStyle: 'italic', marginTop: 8 }}>
               All refund timelines begin after successful Quality Check approval.
            </p>
          </Reveal>
        </div>
      </section>


      {/* ── SECTION 4: EXCHANGE POLICY ──────────────────────────────────────── */}
      <section style={{ background: '#FFFFFF', padding: '10px 0 40px 0' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* <Reveal>
            <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 32, color: '#1E1C1A', borderLeft: '3px solid #C9A84C', paddingLeft: 14, marginBottom: 32 }}>
              Exchange Policy
            </h2>
          </Reveal> */}
          <Reveal delay={80}>
            <HoverCard>
              <div style={{ background: '#FFFFFF', border: '1px solid #EAE5DC', borderRadius: 16, padding: '28px 32px', position: 'relative' }}>
                <span style={{ position: 'absolute', top: 20, right: 24, background: 'rgba(201,168,76,0.12)', color: '#8B6914', borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>
                  One-time only
                </span>
                <div className="flex items-center gap-4 mb-5">
                  <div style={{ background: 'rgba(201,168,76,0.12)', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" />
                    </svg>
                  </div>
                  <span style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 17, fontWeight: 600, color: '#1E1C1A' }}>Exchange Policy</span>
                </div>
                <p style={{ fontSize: 14, color: '#5A5248', lineHeight: 1.75, marginBottom: 20 }}>
                  TAYFA offers a <strong style={{ color: '#1E1C1A' }}>one-time exchange</strong> on eligible items within 7 days of delivery. Exchanges are subject to product availability and must meet the same eligibility conditions as returns.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }} className="space-y-3">
                  {[
                    'Exchange must be requested within 7 days of delivery',
                    'Item must be unused, unworn, and in original packaging with all tags',
                    'Exchange is subject to stock availability of the desired variant',
                    'If desired size/colour is unavailable, a store credit or refund will be issued',
                  ].map((item) => (
                    <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, color: '#3D3530', lineHeight: 1.75 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', background: 'rgba(61,153,112,0.12)', color: '#3D9970', flexShrink: 0, marginTop: 2 }}>
                        <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </HoverCard>
          </Reveal>
        </div>
      </section>

      {/* ── SECTION 5: RETURN ABUSE POLICY ─────────────────────────────────── */}
      <section style={{ background: '#FFFFFF', paddingBottom: 56, paddingTop: 0 }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Reveal delay={80}>
            <div style={{ background: '#FFFCF0', border: '1px solid rgba(201,168,76,0.3)', borderLeft: '3px solid #C9A84C', borderRadius: '0 14px 14px 0', padding: '24px 28px' }}>
              <div className="flex items-start gap-4">
                <div style={{ flexShrink: 0, color: '#C9A84C', marginTop: 2 }}>
                  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div>
                  <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 16, fontWeight: 600, color: '#1E1C1A', marginBottom: 10 }}>Return Abuse Policy</p>
                  <p style={{ fontSize: 14, color: '#5A5248', lineHeight: 1.75, margin: 0 }}>
                    TAYFA reserves the right to refuse returns or exchanges where abuse is suspected. This includes, but is not limited to, returning{' '}
                    <mark style={{ background: 'rgba(201,168,76,0.12)', color: '#7A5010', padding: '1px 5px', borderRadius: 3 }}>worn or used items</mark>,{' '}
                    submitting returns for{' '}
                    <mark style={{ background: 'rgba(201,168,76,0.12)', color: '#7A5010', padding: '1px 5px', borderRadius: 3 }}>mismatched or swapped products</mark>, or accounts with{' '}
                    <mark style={{ background: 'rgba(201,168,76,0.12)', color: '#7A5010', padding: '1px 5px', borderRadius: 3 }}>unusually high return rates</mark>.{' '}
                    Accounts flagged for abuse may have return privileges suspended or accounts permanently restricted.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
};

export default ReturnsAndExchanges;
