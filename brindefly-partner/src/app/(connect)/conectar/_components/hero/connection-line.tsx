'use client'

import { useEffect, useRef } from 'react'

import { prefersReducedMotion } from '@/utils/prefers-reduced-motion'

interface ConnectionLineProps {
  className?: string
}

// Linha Brindefly → Veforma: o tracejado (o original do Figma) corre da
// esquerda para a direita e um pulso azul (gradiente animado por SMIL, só
// visível dentro do tracejado) varre a linha, como dado passando. O CSS de
// reduced-motion não alcança o SMIL, então aqui ele é pausado.
export function ConnectionLine({ className }: ConnectionLineProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) svgRef.current?.pauseAnimations()
  }, [])

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 272.9 2.4"
      width="272.9"
      height="2.4"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient
          id="hero-flow-gradient"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="130"
          y2="0"
        >
          <stop offset="0" stopColor="#2f7bff" stopOpacity="0" />
          <stop offset=".5" stopColor="#2f7bff" />
          <stop offset="1" stopColor="#2f7bff" stopOpacity="0" />
          <animateTransform
            attributeName="gradientTransform"
            type="translate"
            values="-140 0; 283 0; 283 0"
            keyTimes="0; .75; 1"
            dur="2.8s"
            repeatCount="indefinite"
          />
        </linearGradient>
      </defs>

      <path
        d="M1.2 1.2H271.7"
        stroke="#000"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="10 10"
        fill="none"
        className="animate-dash-flow motion-reduce:animate-none"
      />
      <path
        d="M1.2 1.2H271.7"
        stroke="url(#hero-flow-gradient)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="10 10"
        fill="none"
        className="animate-dash-flow drop-shadow-[0_0_3px_rgba(47,123,255,.7)] motion-reduce:animate-none"
      />
    </svg>
  )
}
