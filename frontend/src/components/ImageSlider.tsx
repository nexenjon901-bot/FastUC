import React, { useState } from 'react';

interface ImageSliderProps {
  images: string[];
  title: string;
}

const ImageSlider: React.FC<ImageSliderProps> = ({ images, title }) => {
  const [current, setCurrent] = useState(0);

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent(c => (c - 1 + images.length) % images.length);
  };

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent(c => (c + 1) % images.length);
  };

  const handleTouchStart = React.useRef<number>(0);

  return (
    <div className="relative w-full h-52 overflow-hidden rounded-2xl select-none"
      onTouchStart={e => { handleTouchStart.current = e.touches[0].clientX; }}
      onTouchEnd={e => {
        const diff = handleTouchStart.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) diff > 0 ? setCurrent(c => (c+1)%images.length) : setCurrent(c => (c-1+images.length)%images.length);
      }}
    >
      {/* Image */}
      <img
        key={current}
        src={images[current] || 'https://placehold.co/400x200/1e2040/ffffff?text=PUBG+Account'}
        alt={title}
        className="w-full h-full object-cover animate-slide-in"
        onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x200/1e2040/ffffff?text=PUBG'; }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      {/* Arrows — only show if multiple images */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white border border-white/10 hover:bg-black/70 transition-colors z-10"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white border border-white/10 hover:bg-black/70 transition-colors z-10"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={e => { e.stopPropagation(); setCurrent(i); }}
                className={`transition-all duration-200 rounded-full ${i === current ? 'w-5 h-1.5 bg-[#facc15]' : 'w-1.5 h-1.5 bg-white/40'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageSlider;
