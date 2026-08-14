import React from 'react';
import { Check } from 'lucide-react';
import type { Product } from '../types';
import { formatUzs } from '../api/services';
import { StarIcon, UcIcon } from './icons';

interface Props {
  product: Product;
  selected?: boolean;
  onSelect: (product: Product) => void;
}

const ProductCard: React.FC<Props> = ({ product, selected, onSelect }) => {
  const isStars = product.type === 'STARS';

  return (
    <button
      onClick={() => onSelect(product)}
      className={`relative text-left rounded-2xl p-3.5 transition-all active:scale-[0.97] ${
        selected
          ? isStars
            ? 'bg-gradient-to-br from-yellow-500/15 to-[#1e2040] border-2 border-yellow-400 shadow-[0_0_0_3px_rgba(250,204,21,0.12)]'
            : 'bg-gradient-to-br from-indigo-500/15 to-[#1e2040] border-2 border-indigo-400 shadow-[0_0_0_3px_rgba(99,102,241,0.15)]'
          : 'card border border-white/6'
      }`}
    >
      {selected && (
        <span
          className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center ${
            isStars ? 'bg-yellow-400 text-black' : 'bg-indigo-500 text-white'
          }`}
        >
          <Check size={12} strokeWidth={3} />
        </span>
      )}
      <div className="mb-2">{isStars ? <StarIcon size={36} /> : <UcIcon size={36} />}</div>
      <p className="text-white font-black text-base mb-1">
        {isStars ? `${product.amount} ⭐` : `${product.amount} UC`}
      </p>
      <p className={`text-xs font-bold ${isStars ? 'text-yellow-400' : 'text-indigo-300'}`}>
        {formatUzs(product.price)}
      </p>
    </button>
  );
};

export default ProductCard;
