// all the little line icons, drawn with svg
const paths = {
  heart: <path d="M12 20s-7-4.4-9-8.5C1.6 8.6 3.5 5 7 5c2 0 3.5 1.2 5 3 1.5-1.8 3-3 5-3 3.5 0 5.4 3.6 4 6.5-2 4.1-9 8.5-9 8.5z" />,
  comment: <path d="M21 12a9 9 0 0 1-13.3 7.9L3 21l1.1-4.7A9 9 0 1 1 21 12z" />,
  send: <><path d="M22 3L10 14" /><path d="M22 3l-7 18-3-7-7-3z" /></>,
  bookmark: <path d="M6 3h12v18l-6-5-6 5z" />,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  pin: <><path d="M12 21s-7-6.3-7-12a7 7 0 0 1 14 0c0 5.7-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" /></>,
  people: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" /></>,
  chevronRight: <path d="M9 5l7 7-7 7" />,
  home: <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></>,
  plus: <><rect x="3" y="3" width="18" height="18" rx="5" /><path d="M12 8v8M8 12h8" /></>,
  reels: <><rect x="3" y="3" width="18" height="18" rx="5" /><path d="M10 9l5 3-5 3z" /></>,
  check: <path d="M5 12l5 5 9-10" />,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  doc: <><path d="M6 3h8l4 4v14H6z" /><path d="M9 12h6M9 16h6" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M5 21c0-3.9 3.1-7 7-7s7 3.1 7 7" /></>,
  chevronDown: <path d="M6 9l6 6 6-6" />,
}

export default function Icon({ name, size = 24, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  )
}
