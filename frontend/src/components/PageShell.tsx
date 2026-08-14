import React from 'react';
import Header from './Header';

interface Props {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showFeedback?: boolean;
  right?: React.ReactNode;
  className?: string;
}

const PageShell: React.FC<Props> = ({
  children,
  title,
  showBack,
  onBack,
  showFeedback = true,
  right,
  className = '',
}) => {
  return (
    <div className={`min-h-screen bg-[#12132b] pb-24 ${className}`}>
      <Header title={title} showBack={showBack} onBack={onBack} showFeedback={showFeedback} right={right} />
      <div style={{ padding: '16px' }}>{children}</div>
    </div>
  );
};

export default PageShell;
