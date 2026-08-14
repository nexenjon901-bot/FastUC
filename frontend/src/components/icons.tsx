import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

export const UcIcon: React.FC<IconProps> = ({ size = 48, className }) => (
  <img
    src="/icon-uc-transparent.png"
    alt="PUBG UC"
    className={className}
    width={size}
    height={size}
    style={{
      width: size,
      height: size,
      objectFit: 'contain',
      display: 'block',
      filter: 'drop-shadow(0 4px 18px rgba(212,170,0,0.55))',
    }}
    draggable={false}
  />
);

export const StarIcon: React.FC<IconProps> = ({ size = 48, className }) => (
  <img
    src="/icon-stars-transparent.png"
    alt="Telegram Stars"
    className={className}
    width={size}
    height={size}
    style={{
      width: size,
      height: size,
      objectFit: 'contain',
      display: 'block',
      filter: 'drop-shadow(0 4px 18px rgba(250,200,0,0.55))',
    }}
    draggable={false}
  />
);
