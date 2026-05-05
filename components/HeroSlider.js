'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'

const slides = [
  {
    src: '/images/water-crisis.png',
    badge: '💧 WATER CRISIS',
    location: '📍 Dhaka, Bangladesh',
    caption: 'Millions of Dhaka residents face daily water shortages',
    sub: '💧 ⚡ 🔥 Public Sheba DHK — Real-time Utility Monitoring',
  },
  {
    src: '/images/loadshedding.png',
    badge: '⚡ LOAD SHEDDING',
    location: '📍 Dhaka, Bangladesh',
    caption: 'Power outages disrupt daily life across Dhaka neighborhoods',
    sub: '💧 ⚡ 🔥 Public Sheba DHK — Real-time Utility Monitoring',
  },
  {
    src: '/images/gas_crisis.png',
    badge: '🔥 GAS CRISIS',
    location: '📍 Dhaka, Bangladesh',
    caption: 'Gas supply failures leave households without cooking fuel',
    sub: '💧 ⚡ 🔥 Public Sheba DHK — Real-time Utility Monitoring',
  },
]

export default function HeroSlider() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  const slide = slides[current]

  return (
    <div style={{ width: '100%', background: '#000' }}>

      {/* Image — full width, full height, no cropping */}
      <div style={{ position: 'relative', width: '100%' }}>
        <img
          src={slide.src}
          alt={slide.caption}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            objectFit: 'contain',
          }}
        />

        {/* Slide counter top-left */}
        <div style={{
          position: 'absolute',
          top: '14px',
          left: '16px',
          background: 'rgba(0,0,0,0.55)',
          color: '#fff',
          fontSize: '13px',
          fontWeight: '600',
          padding: '4px 10px',
          borderRadius: '6px',
          backdropFilter: 'blur(4px)',
        }}>
          {current + 1} / {slides.length}
        </div>

        {/* Progress bar top-right */}
        <div style={{
          position: 'absolute',
          top: '18px',
          right: '16px',
          width: '60px',
          height: '4px',
          background: 'rgba(255,255,255,0.25)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            background: '#fff',
            borderRadius: '2px',
            width: `${((current + 1) / slides.length) * 100}%`,
            transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      {/* Caption bar below image */}
      <div style={{
        background: '#111',
        padding: '14px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
          <span style={{
            background: '#2563eb',
            color: '#fff',
            fontSize: '11px',
            fontWeight: '700',
            padding: '3px 10px',
            borderRadius: '4px',
            letterSpacing: '0.05em',
          }}>
            {slide.badge}
          </span>
          <span style={{ color: '#9ca3af', fontSize: '12px' }}>{slide.location}</span>
        </div>

        <p style={{
          color: '#fff',
          fontWeight: '700',
          fontSize: '16px',
          lineHeight: '1.4',
          margin: '0 0 8px',
        }}>
          {slide.caption}
        </p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            color: '#d1d5db',
            fontSize: '12px',
            fontWeight: '500',
            padding: '5px 12px',
            borderRadius: '6px',
          }}>
            {slide.sub}
          </div>

          {/* Dot indicators */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                style={{
                  width: i === current ? '20px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: i === current ? '#2563eb' : 'rgba(255,255,255,0.35)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}