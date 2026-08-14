import React from 'react';
import { Check, Clock3, PackageCheck, ShieldCheck, Truck } from 'lucide-react';
import type { OrderStatus } from '../types';
import { statusLabel } from '../api/services';

const steps: { key: OrderStatus; icon: React.ElementType }[] = [
  { key: 'PAYMENT_PENDING', icon: Clock3 },
  { key: 'PAYMENT_CHECKING', icon: ShieldCheck },
  { key: 'CONFIRMED', icon: Check },
  { key: 'DELIVERING', icon: Truck },
  { key: 'COMPLETED', icon: PackageCheck },
];

const orderIndex = (status: OrderStatus) => {
  if (status === 'CANCELLED') return -1;
  return steps.findIndex((s) => s.key === status);
};

const StatusTimeline: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const current = orderIndex(status);

  if (status === 'CANCELLED') {
    return (
      <div className="card" style={{ padding: 14, color: 'var(--error)', fontWeight: 700 }}>
        Buyurtma bekor qilindi
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 16 }}>
      <p className="section-label" style={{ marginBottom: 14 }}>Status timeline</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {steps.map((step, i) => {
          const Icon = step.icon;
          const done = i <= current;
          const active = i === current;
          return (
            <div key={step.key} style={{ display: 'flex', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    background: done ? 'var(--primary)' : 'var(--bg-elevated)',
                    border: `1.5px solid ${done ? 'var(--primary)' : 'var(--border)'}`,
                    boxShadow: active ? '0 0 0 4px var(--primary-soft)' : 'none',
                    color: done ? '#fff' : 'var(--text-muted)',
                  }}
                >
                  <Icon size={14} />
                </div>
                {i < steps.length - 1 && (
                  <div
                    style={{
                      width: 2,
                      flex: 1,
                      minHeight: 18,
                      background: i < current ? 'var(--primary)' : 'var(--border-subtle)',
                    }}
                  />
                )}
              </div>
              <div style={{ paddingBottom: i < steps.length - 1 ? 14 : 0, paddingTop: 4 }}>
                <p style={{ fontSize: 13, fontWeight: 800, color: done ? 'var(--text)' : 'var(--text-muted)' }}>
                  {statusLabel(step.key)}
                </p>
                {active && (
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>Joriy holat</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusTimeline;
