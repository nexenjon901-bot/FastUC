import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

export const UcIcon: React.FC<IconProps> = ({ size = 48, className }) => (
  <img
    src="/icon-uc.png"
    alt="PUBG UC"
    className={className}
    width={size}
    height={size}
    style={{
      width: size,
      height: size,
      objectFit: 'contain',
      display: 'block',
      filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.35))',
    }}
    draggable={false}
  />
);

export const StarIcon: React.FC<IconProps> = ({ size = 48, className }) => (
  <img
    src="/icon-stars.png"
    alt="Telegram Stars"
    className={className}
    width={size}
    height={size}
    style={{
      width: size,
      height: size,
      objectFit: 'contain',
      display: 'block',
      filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.35))',
    }}
    draggable={false}
  />
);
