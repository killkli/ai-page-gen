
import React from 'react';

interface SectionCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const SectionCard: React.FC<SectionCardProps> = React.memo(({ title, icon, children, className }) => {
  return (
    <div className={`bg-white shadow-lg rounded-xl p-6 mb-6 ${className || ''}`}>
      <h2 className="text-2xl font-semibold text-sky-700 mb-4 flex items-center">
        {icon && <span className="mr-3 text-sky-600">{icon}</span>}
        {title}
      </h2>
      <div className="text-slate-700 space-y-3">
        {children}
      </div>
    </div>
  );
});

export default SectionCard;
