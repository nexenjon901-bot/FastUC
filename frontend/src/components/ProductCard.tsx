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
      className={`relative flex flex-col items-center justify-center rounded-[18px] p-4 transition-all active:scale-[0.97] min-h-[180px] ${
        selected
          ? isStars
            ? 'bg-[#181932] border-2 border-yellow-400'
            : 'bg-[#181932] border-2 border-[#5a67d8]'
          : 'bg-[#181932] border border-[#2b2d55]'
      }`}
    >
      {selected && (
        <span
          className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center ${
            isStars ? 'bg-yellow-400 text-black' : 'bg-[#5a67d8] text-white'
          }`}
        >
          <Check size={12} strokeWidth={3} />
        </span>
      )}
      <div className="flex-1 flex items-center justify-center mb-4">
        {isStars ? <StarIcon size={76} /> : <UcIcon size={76} />}
      </div>
      <div className="text-center w-full">
        <p className="text-white font-bold text-[15px] mb-1.5">
          {isStars ? `${product.amount} Stars` : `${product.amount} UC`}
        </p>
        <p className={`text-[13px] font-semibold ${isStars ? 'text-[#6366f1]' : 'text-[#6366f1]'}`}>
          {formatUzs(product.price)}
        </p>
      </div>
    </button>
  );
};

export default ProductCard;
