import React from 'react';

interface SectionCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const SectionCard: React.FC<SectionCardProps> = React.memo(
  ({ title, icon, children, className }) => {
    return (
      <div
        className={`bg-surface shadow-lg rounded-xl p-6 mb-6 border border-border transition-colors duration-200 ${className || ''}`}
      >
        <h2 className="text-2xl font-semibold text-[var(--color-primary)] mb-4 flex items-center transition-colors duration-200">
          {icon && (
            <span className="mr-3 text-[var(--color-primary)] opacity-90">
              {icon}
            </span>
          )}
          {title}
        </h2>
        <div className="text-secondary space-y-3 transition-colors duration-200">
          {children}
        </div>
      </div>
    );
  }
);

export default SectionCard;
