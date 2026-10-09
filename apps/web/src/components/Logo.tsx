import React from 'react'

interface LogoProps {
  className?: string
  size?: number
}

export const Logo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="hubbub-grad-primary" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="hubbub-grad-glow" x1="16" y1="16" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Outer subtle halo ring */}
      <circle cx="32" cy="32" r="30" stroke="url(#hubbub-grad-primary)" strokeWidth="1.5" strokeOpacity="0.25" strokeDasharray="3 3" />

      {/* Left Chat / Agent Beacon (Forms left stem of 'H') */}
      <path
        d="M16 14C16 11.7909 17.7909 10 20 10H24C26.2091 10 28 11.7909 28 14V34C28 37.3137 25.3137 40 22 40H18L14 44V16C14 14.8954 14.8954 14 16 14Z"
        fill="url(#hubbub-grad-primary)"
      />

      {/* Right Chat / Agent Beacon (Forms right stem of 'H') */}
      <path
        d="M48 50C48 52.2091 46.2091 54 44 54H40C37.7909 54 36 52.2091 36 50V30C36 26.6863 38.6863 24 42 24H46L50 20V48C50 49.1046 49.1046 50 48 50Z"
        fill="url(#hubbub-grad-primary)"
      />

      {/* Central Dialogue Bridge & Core Spark (Forms crossbar of 'H') */}
      <rect x="22" y="27" width="20" height="10" rx="5" fill="#4f46e5" />
      <circle cx="32" cy="32" r="3.5" fill="#ffffff" />
      <circle cx="32" cy="32" r="6" stroke="#a78bfa" strokeWidth="1.5" strokeOpacity="0.7" />
    </svg>
  )
}
