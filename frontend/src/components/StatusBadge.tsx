import React from 'react';

const tones = {
  success: { bg: 'var(--success-soft)', color: 'var(--success)' },
  warning: { bg: 'var(--warning-soft)', color: 'var(--warning)' },
  error: { bg: 'var(--error-soft)', color: 'var(--error)' },
  primary: { bg: 'var(--primary-soft)', color: 'var(--primary-light)' },
  muted: { bg: 'rgba(146,152,194,0.12)', color: 'var(--text-secondary)' },
} as const;

interface Props {
  label: string;
  tone?: keyof typeof tones;
}

const StatusBadge: React.FC<Props> = ({ label, tone = 'muted' }) => {
  const t = tones[tone];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 8px',
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 800,
        background: t.bg,
        color: t.color,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
