export default function Icon({ name, size = 22 }) {
  const paths = {
    plane: <><path d="m3 11 18-5-6 6 3 5-2 1-5-4-4 3-2-1 3-4-5-1Z"/><path d="m11 12 3-9 2 1-1 8"/></>,
    steering: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/><path d="M3.5 10h17M12 14v7m0-9-5 7m5-7 5 7"/></>,
    route: <><circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h3a3 3 0 0 0 3-3V9a3 3 0 0 1 3-3"/></>,
    helicopter: <><path d="M7 10h9a4 4 0 0 1 4 4H7a3 3 0 0 1 0-6h4"/><path d="M12 8V5m-5 0h10M4 18h14m-2-4v4M6 14v4"/></>,
    jet: <><path d="M2 16 22 8l-8 7 5 4-2 1-7-3-5 3-2-1 4-4-5 1Z"/><path d="m10 15 3-11 2 1-1 8"/></>,
    yacht: <><path d="m4 14 3 5h10l3-5H4Z"/><path d="M12 14V4l6 8h-6m0-6L7 13"/><path d="M3 22c2-1 3-1 5 0 2-1 3-1 5 0 2-1 3-1 5 0"/></>,
    taxi: <><path d="m5 10 2-5h10l2 5"/><path d="M4 10h16v8H4z"/><path d="M6 18v2m12-2v2M7 14h.01M17 14h.01M9 5V3h6v2"/></>,
    shuttle: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M6 8h12v6H6zM7 19v2m10-2v2M7 16h.01M17 16h.01"/></>,
    phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></>,
    bag: <><rect x="5" y="7" width="14" height="14" rx="2"/><path d="M9 7V5a3 3 0 0 1 6 0v2M9 11v6m6-6v6"/></>,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
