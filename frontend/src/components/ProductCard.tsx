import React from 'react';

interface ProductCardProps {
  image?: string;
  title: string;
  oldPrice?: number;
  price: number;
  currency?: string;
  sellerAvatar?: string;
  sellerName?: string;
  isVerified?: boolean;
  discountBadge?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  image,
  title,
  oldPrice,
  price,
  currency = 'UZS',
  sellerAvatar,
  sellerName,
  isVerified = true,
  discountBadge
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-card border border-[#333742] transition-transform hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/20 cursor-pointer flex flex-col group">
      
      {/* Bottom glowing border effect */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-accent-light opacity-0 group-hover:opacity-100 transition-opacity z-10" />

      {/* Image container */}
      <div className="relative h-40 w-full overflow-hidden bg-[#1c1e22]">
        <img src={image || 'https://via.placeholder.com/300x160'} alt={title} className="w-full h-full object-cover" />
        
        {/* Showcase badge */}
        <div className="absolute bottom-2 left-2 bg-accent/90 backdrop-blur-sm px-2 py-1 rounded flex items-center gap-1">
          <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">Showcase</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-[15px] text-white line-clamp-2 leading-tight mb-3">
          {title}
        </h3>

        <div className="mt-auto">
          {/* Pricing */}
          <div className="flex flex-col mb-4">
            {oldPrice && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted line-through">
                  {oldPrice.toLocaleString()} {currency}
                </span>
                {discountBadge && (
                  <span className="bg-[#e95a15] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                    {discountBadge}
                  </span>
                )}
              </div>
            )}
            <div className="text-lg font-bold text-white leading-none mt-1">
              {price.toLocaleString()}<span className="text-xs ml-1 font-normal text-text-muted">{currency}</span>
            </div>
          </div>

          {/* Seller Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-[#333742]/50">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full overflow-hidden bg-[#1c1e22]">
                <img src={sellerAvatar || 'https://via.placeholder.com/40'} alt={sellerName} className="w-full h-full object-cover" />
              </div>
              <span className="text-xs text-text-muted font-medium truncate max-w-[100px]">
                {sellerName || 'Seller'}
              </span>
              {isVerified && (
                <svg className="w-3.5 h-3.5 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
