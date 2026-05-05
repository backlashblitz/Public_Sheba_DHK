'use client'
import { useLang } from '@/lib/LangContext'
import { useState } from 'react'

const guideContent = {
  en: {
    title: 'How to use Public Sheba DHK',
    subtitle: 'A quick guide for first-time users',
    sections: [
      {
        icon: '📋',
        title: 'Step 1 — Create an account',
        body: 'To submit a report or subscribe to zone alerts, you need to create a free account. Click "Sign in" in the top right corner, then click "Sign up". Enter your name, email address and a password. That\'s it — your account is ready.'
      },
      {
        icon: '🗺️',
        title: 'Step 2 — Check the Live Map',
        body: 'When you open the website, you will see a live map of Dhaka. Each circle on the map represents a zone. Green means everything is normal. Yellow/orange means some issues have been reported. Red means a confirmed outage. Click on any circle to see details about that zone — including water, electricity and gas status separately.'
      },
      {
        icon: '🚨',
        title: 'Step 3 — Report an issue',
        body: 'If you are experiencing a problem with water, electricity or gas in your area, click "Report Issue" in the navbar. Select the utility type (water, electricity or gas), choose your zone, describe the problem type, and say how long it has been happening. You can also add extra details. Submit the report — it takes less than 30 seconds.'
      },
      {
        icon: '👍',
        title: 'Step 4 — Confirm others\' reports',
        body: 'In the Live Reports panel on the right side of the map, you will see reports submitted by other people in your area. If you have the same problem, click "Me too" to confirm that report. This helps the system detect real outages faster — when 10 or more people confirm the same issue, the zone turns red.'
      },
      {
        icon: '🔔',
        title: 'Step 5 — Subscribe to zone alerts',
        body: 'Click on any zone circle on the map. In the popup, you will see a "Subscribe to alerts" button. Click it to subscribe. Whenever the admin changes that zone\'s status (e.g. a water outage is confirmed), you will receive an instant notification in the bell icon at the top of the page.'
      },
      {
        icon: '📢',
        title: 'Announcements',
        body: 'If WASA, DESCO, or Titas Gas plans a scheduled shutdown, the admin will post an announcement that appears as a yellow banner at the top of the map page. This works like the miking announcements you hear in your area — but delivered to your phone or computer.'
      },
      {
        icon: '💬',
        title: 'Admin replies',
        body: 'If you write something in the "Extra details" box when submitting a report, the admin (WASA/DESCO officer) may reply to your specific note. You will see a green "Admin replied" badge on your report in the live feed. Click "Details" to read the reply.'
      },
    ]
  },
  bn: {
    title: 'পাবলিক সেবা ঢাকা — ব্যবহার নির্দেশিকা',
    subtitle: 'নতুন ব্যবহারকারীদের জন্য সহজ গাইড',
    sections: [
      {
        icon: '📋',
        title: 'ধাপ ১ — অ্যাকাউন্ট তৈরি করুন',
        body: 'রিপোর্ট দিতে বা এলাকার আপডেট পেতে একটি বিনামূল্যে অ্যাকাউন্ট লাগবে। উপরে ডানদিকে "সাইন ইন" বাটনে ক্লিক করুন, তারপর "সাইন আপ" নির্বাচন করুন। আপনার নাম, ইমেইল এবং পাসওয়ার্ড দিন — ব্যস, অ্যাকাউন্ট তৈরি হয়ে যাবে।'
      },
      {
        icon: '🗺️',
        title: 'ধাপ ২ — লাইভ ম্যাপ দেখুন',
        body: 'ওয়েবসাইট খুললে ঢাকার একটি লাইভ ম্যাপ দেখা যাবে। ম্যাপে প্রতিটি বৃত্ত একটি এলাকা প্রতিনিধিত্ব করে। সবুজ মানে সব স্বাভাবিক। হলুদ/কমলা মানে কিছু সমস্যার রিপোর্ট এসেছে। লাল মানে নিশ্চিত বিভ্রাট। যেকোনো বৃত্তে ক্লিক করলে সেই এলাকার পানি, বিদ্যুৎ ও গ্যাসের আলাদা অবস্থা দেখা যাবে।'
      },
      {
        icon: '🚨',
        title: 'ধাপ ৩ — সমস্যা জানান',
        body: 'পানি, বিদ্যুৎ বা গ্যাসের সমস্যা হলে নেভিগেশন বারে "সমস্যা জানান" বাটনে ক্লিক করুন। সেবার ধরন (পানি, বিদ্যুৎ বা গ্যাস) বেছে নিন, আপনার এলাকা সিলেক্ট করুন, সমস্যার ধরন বেছে নিন এবং কতক্ষণ ধরে হচ্ছে তা জানান। ৩০ সেকেন্ডের কম সময়ে রিপোর্ট দেওয়া যাবে।'
      },
      {
        icon: '👍',
        title: 'ধাপ ৪ — অন্যদের রিপোর্ট নিশ্চিত করুন',
        body: 'ম্যাপের ডানদিকে লাইভ রিপোর্ট প্যানেলে অন্যদের দেওয়া রিপোর্ট দেখা যাবে। আপনারও একই সমস্যা হলে "আমারও" বাটনে ক্লিক করুন। ১০ বা তার বেশি মানুষ একই সমস্যা নিশ্চিত করলে এলাকাটি লাল হয়।'
      },
      {
        icon: '🔔',
        title: 'ধাপ ৫ — এলাকার আপডেট সাবস্ক্রাইব করুন',
        body: 'ম্যাপে যেকোনো বৃত্তে ক্লিক করলে একটি "Subscribe to alerts" বাটন দেখা যাবে। এতে ক্লিক করলে সেই এলাকার স্ট্যাটাস পরিবর্তন হলে আপনি তাৎক্ষণিক নোটিফিকেশন পাবেন — পেজের উপরে বেল আইকনে।'
      },
      {
        icon: '📢',
        title: 'পূর্ব ঘোষণা',
        body: 'ওয়াসা, ডেসকো বা তিতাস গ্যাস কোনো পরিকল্পিত শাটডাউনের ঘোষণা দিলে অ্যাডমিন ম্যাপ পেজের উপরে একটি হলুদ ব্যানারে তা প্রকাশ করবেন। এটি আপনার এলাকায় মাইকিং ঘোষণার ডিজিটাল সংস্করণ।'
      },
      {
        icon: '💬',
        title: 'অ্যাডমিনের উত্তর',
        body: 'রিপোর্ট দেওয়ার সময় "অতিরিক্ত তথ্য" বক্সে কিছু লিখলে অ্যাডমিন (ওয়াসা/ডেসকো অফিসার) আপনার নোটে সরাসরি উত্তর দিতে পারবেন। লাইভ ফিডে আপনার রিপোর্টে সবুজ "Admin replied" ব্যাজ দেখা যাবে। "Details" ক্লিক করে উত্তর পড়ুন।'
      },
    ]
  }
}

export default function GuidePage() {
  const { lang } = useLang()
  const [open, setOpen] = useState(null)
  const content = guideContent[lang] || guideContent.en

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>

      <style>{`
        @keyframes blob1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(40px, -50px) scale(1.1); }
          66% { transform: translate(-30px, 30px) scale(0.95); }
        }
        @keyframes blob2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(-40px, 40px) scale(1.08); }
          66% { transform: translate(50px, -30px) scale(0.92); }
        }
        @keyframes blob3 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, 30px) scale(1.05); }
          66% { transform: translate(-40px, -20px) scale(1.1); }
        }
        @keyframes blob4 {
          0%, 100% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
          50% { transform: translate(-20px, 40px) scale(1.07) rotate(45deg); }
        }
        @keyframes blob5 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(30px, -40px) scale(1.12); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spinReverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes drift {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(15px, -20px); }
          50% { transform: translate(-10px, -35px); }
          75% { transform: translate(-20px, -15px); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .guide-card {
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1.5px solid rgba(255,255,255,0.9);
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 12px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04);
          transition: box-shadow 0.2s ease, transform 0.2s ease;
          animation: fadeSlideIn 0.4s ease;
        }
        .guide-card:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          transform: translateY(-1px);
        }
        .guide-btn {
          width: 100%;
          padding: 18px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          text-align: left;
          background: transparent;
          border: none;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.2s;
        }
        .guide-btn:hover {
          background: rgba(249,250,251,0.8);
        }
      `}</style>

      {/* ── ANIMATED BACKGROUND — pure CSS shapes ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden' }}>

        {/* Base gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #e0e7ff 0%, #f5f3ff 25%, #fce7f3 50%, #ecfdf5 75%, #fef3c7 100%)',
        }} />

        {/* Large blob 1 — top left */}
        <div style={{
          position: 'absolute',
          top: '-150px', left: '-150px',
          width: '600px', height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 40%, rgba(37,99,235,0.18), rgba(37,99,235,0.06), transparent 65%)',
          animation: 'blob1 12s ease-in-out infinite',
        }} />

        {/* Large blob 2 — bottom right */}
        <div style={{
          position: 'absolute',
          bottom: '-120px', right: '-120px',
          width: '550px', height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 60% 60%, rgba(16,185,129,0.15), rgba(16,185,129,0.06), transparent 65%)',
          animation: 'blob2 15s ease-in-out infinite',
        }} />

        {/* Medium blob 3 — top right */}
        <div style={{
          position: 'absolute',
          top: '8%', right: '5%',
          width: '400px', height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.14), rgba(167,139,250,0.06), transparent 65%)',
          animation: 'blob3 18s ease-in-out infinite',
        }} />

        {/* Medium blob 4 — middle left */}
        <div style={{
          position: 'absolute',
          top: '45%', left: '-80px',
          width: '350px', height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236,72,153,0.1), transparent 65%)',
          animation: 'blob4 20s ease-in-out infinite',
        }} />

        {/* Small blob 5 — center */}
        <div style={{
          position: 'absolute',
          top: '30%', left: '55%',
          width: '280px', height: '280px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.1), transparent 65%)',
          animation: 'blob5 14s ease-in-out infinite',
        }} />

        {/* Spinning ring 1 */}
        <div style={{
          position: 'absolute',
          top: '12%', right: '12%',
          width: '220px', height: '220px',
          borderRadius: '50%',
          border: '1.5px solid rgba(37,99,235,0.12)',
          animation: 'spin 25s linear infinite',
        }} />

        {/* Spinning ring 2 */}
        <div style={{
          position: 'absolute',
          top: '7%', right: '7%',
          width: '340px', height: '340px',
          borderRadius: '50%',
          border: '1px solid rgba(139,92,246,0.08)',
          animation: 'spinReverse 35s linear infinite',
        }} />

        {/* Spinning ring 3 — bottom left */}
        <div style={{
          position: 'absolute',
          bottom: '15%', left: '5%',
          width: '280px', height: '280px',
          borderRadius: '50%',
          border: '1.5px solid rgba(16,185,129,0.1)',
          animation: 'spin 30s linear infinite',
        }} />

        {/* Spinning ring 4 — small center right */}
        <div style={{
          position: 'absolute',
          top: '50%', right: '20%',
          width: '150px', height: '150px',
          borderRadius: '50%',
          border: '1px solid rgba(236,72,153,0.1)',
          animation: 'spinReverse 20s linear infinite',
        }} />

        {/* Drifting dots */}
        {[
          { top: '18%', left: '12%', size: 8, color: 'rgba(37,99,235,0.35)', delay: '0s', dur: '8s' },
          { top: '72%', left: '82%', size: 6, color: 'rgba(139,92,246,0.35)', delay: '2s', dur: '10s' },
          { top: '38%', left: '92%', size: 10, color: 'rgba(16,185,129,0.3)', delay: '1s', dur: '12s' },
          { top: '82%', left: '18%', size: 7, color: 'rgba(236,72,153,0.3)', delay: '3s', dur: '9s' },
          { top: '8%', left: '58%', size: 5, color: 'rgba(245,158,11,0.35)', delay: '0.5s', dur: '11s' },
          { top: '62%', left: '3%', size: 9, color: 'rgba(37,99,235,0.25)', delay: '4s', dur: '7s' },
          { top: '22%', left: '78%', size: 6, color: 'rgba(245,158,11,0.3)', delay: '1.5s', dur: '13s' },
          { top: '88%', left: '58%', size: 8, color: 'rgba(139,92,246,0.3)', delay: '2.5s', dur: '9s' },
          { top: '50%', left: '45%', size: 5, color: 'rgba(16,185,129,0.25)', delay: '3.5s', dur: '14s' },
          { top: '33%', left: '25%', size: 7, color: 'rgba(236,72,153,0.2)', delay: '0.8s', dur: '10s' },
        ].map((dot, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: dot.top, left: dot.left,
            width: `${dot.size}px`, height: `${dot.size}px`,
            borderRadius: '50%',
            background: dot.color,
            animation: `drift ${dot.dur} ease-in-out infinite ${dot.delay}`,
          }} />
        ))}

        {/* Subtle grid dots */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, #94a3b825 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
      </div>

      {/* ── PAGE CONTENT ── */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '720px', margin: '0 auto', padding: '48px 20px 60px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>

          {/* Live badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.9)',
            borderRadius: '30px',
            padding: '6px 16px',
            marginBottom: '18px',
          }}>
            <span style={{ fontSize: '16px' }}>📖</span>
            <span style={{ fontSize: '12px', color: '#374151', fontWeight: '600' }}>
              User Guide · Public Sheba DHK
            </span>
          </div>

          <h1 style={{
            fontSize: '30px',
            fontWeight: '900',
            color: '#111827',
            margin: '0 0 10px',
            letterSpacing: '-0.5px',
          }}>
            {content.title}
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '15px',
            margin: 0,
          }}>
            {content.subtitle}
          </p>

          {/* Utility pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
            {[
              { icon: '💧', label: 'Water', color: '#2563eb', bg: '#eff6ff' },
              { icon: '⚡', label: 'Electricity', color: '#d97706', bg: '#fffbeb' },
              { icon: '🔥', label: 'Gas', color: '#dc2626', bg: '#fef2f2' },
            ].map(p => (
              <div key={p.label} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(255,255,255,0.75)',
                backdropFilter: 'blur(8px)',
                border: `1.5px solid ${p.color}30`,
                borderRadius: '20px',
                padding: '5px 14px',
                fontSize: '12px',
                fontWeight: '600',
                color: p.color,
              }}>
                <span>{p.icon}</span>
                <span>{p.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Guide sections */}
        <div>
          {content.sections.map((section, i) => (
            <div key={i} className="guide-card">
              <button
                className="guide-btn"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '44px', height: '44px',
                    background: open === i
                      ? 'linear-gradient(135deg, #2563eb, #7c3aed)'
                      : 'rgba(243,244,246,0.9)',
                    borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '22px',
                    flexShrink: 0,
                    transition: 'background 0.3s ease',
                    boxShadow: open === i ? '0 4px 14px rgba(37,99,235,0.3)' : 'none',
                  }}>
                    {section.icon}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      fontWeight: '700',
                      color: open === i ? '#1d4ed8' : '#111827',
                      transition: 'color 0.2s',
                    }}>
                      {section.title}
                    </p>
                    {open !== i && (
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#9ca3af' }}>
                        Click to expand
                      </p>
                    )}
                  </div>
                </div>

                <div style={{
                  width: '28px', height: '28px',
                  borderRadius: '50%',
                  background: open === i ? '#2563eb' : 'rgba(243,244,246,0.9)',
                  border: open === i ? 'none' : '1.5px solid #e5e7eb',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.3s ease',
                  transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)',
                }}>
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                    <path d="M1 1l4 4 4-4" stroke={open === i ? 'white' : '#6b7280'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </button>

              {open === i && (
                <div style={{
                  padding: '0 22px 20px',
                  animation: 'fadeSlideIn 0.3s ease',
                }}>
                  <div style={{ height: '1px', background: 'rgba(229,231,235,0.8)', marginBottom: '16px' }} />
                  <p style={{
                    fontSize: '14px',
                    color: '#4b5563',
                    lineHeight: '1.8',
                    margin: 0,
                  }}>
                    {section.body}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom info card */}
        <div style={{
          marginTop: '24px',
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(37,99,235,0.2)',
          borderRadius: '20px',
          padding: '22px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(37,99,235,0.08)',
        }}>
          <div style={{ fontSize: '28px', marginBottom: '10px' }}>💬</div>
          <p style={{ fontSize: '14px', fontWeight: '700', color: '#1e40af', margin: '0 0 6px' }}>
            Still have questions?
          </p>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, lineHeight: '1.6' }}>
            The admin team monitors reports daily. Submit a report with details and they will respond directly to your note.
          </p>
        </div>

      </div>
    </div>
  )
}