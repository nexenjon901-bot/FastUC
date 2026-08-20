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
      mixBlendMode: 'screen',
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
      mixBlendMode: 'screen',
    }}
    draggable={false}
  />
);

export const CardsIcon: React.FC<IconProps> = ({ size = 48, className }) => (
  <img
    src="/icon-cards.png"
    alt="UZCARD / HUMO"
    className={className}
    width={size}
    height={size}
    style={{
      width: size,
      height: size,
      objectFit: 'contain',
      display: 'block',
    }}
    draggable={false}
  />
);

export const AtmIcon: React.FC<IconProps> = ({ size = 48, className }) => (
  <img
    src="/icon-atm.png"
    alt="BANKOMAT"
    className={className}
    width={size}
    height={size}
    style={{
      width: size,
      height: size,
      objectFit: 'contain',
      display: 'block',
      mixBlendMode: 'screen',
    }}
    draggable={false}
  />
);
