import { useEffect, useState } from 'react';

/**
 * Auto-dismissing toast notification.
 *
 * Props:
 *  - message (string)
 *  - type ('success' | 'error' | 'info')
 *  - onClose ()
 *  - duration (number, ms) — default 4000
 */
export default function Toast({ message, type = 'info', onClose, duration = 4000 }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    success: 'border-success-500 bg-success-500/10 text-success-500',
    error: 'border-error-500 bg-error-500/10 text-error-500',
    info: 'border-primary-400 bg-primary-400/10 text-primary-400',
  };

  const icons = {
    success: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div
      className={`fixed top-6 right-6 max-w-sm w-full border rounded-xl px-4 py-3.5 shadow-2xl
                  flex items-center gap-3 ${colors[type]}
                  ${exiting ? 'opacity-0 translate-x-8' : 'animate-slide-down'}
                  transition-all duration-300`}
      style={{ zIndex: 100, backdropFilter: 'blur(12px)' }}
    >
      {icons[type]}
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={() => { setExiting(true); setTimeout(onClose, 300); }}
        className="text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
