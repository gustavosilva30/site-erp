import React from 'react'

/** Miniatura do selo/logo do Detran para credenciamento de desmontes */
export function DetranBadgeIcon({ className = 'detran-mini-icon' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
      aria-hidden="true"
    >
      <rect x="1" y="1" width="22" height="22" rx="4" fill="#006633" stroke="#004D25" strokeWidth="1" />
      <path
        d="M12 3.5L5.5 6.5V11.5C5.5 15.8 8.3 19.6 12 20.5C15.7 19.6 18.5 15.8 18.5 11.5V6.5L12 3.5Z"
        fill="#008040"
        stroke="#FFFFFF"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path d="M12 6.8L13.1 9.1H15.6L13.6 10.6L14.4 13L12 11.5L9.6 13L10.4 10.6L8.4 9.1H10.9L12 6.8Z" fill="#FACC15" />
    </svg>
  )
}
