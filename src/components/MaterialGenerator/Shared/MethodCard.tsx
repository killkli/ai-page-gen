import React from 'react';

interface MethodCardProps {
    id: string;
    title: string;
    description: string;
    selected: boolean;
    onSelect: (id: string) => void;
    icon?: React.ReactNode;
}

const MethodCard: React.FC<MethodCardProps> = ({
    id,
    title,
    description,
    selected,
    onSelect,
    icon
}) => {
    return (
        <div
            onClick={() => onSelect(id)}
            className={`
        cursor-pointer rounded-xl p-4 border-2 transition-all duration-200 relative overflow-hidden group
        ${selected
                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                }
      `}
        >
            <div className="flex items-start gap-3">
                <div className={`
          p-2 rounded-lg flex-shrink-0 transition-colors
          ${selected ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-500'}
        `}>
                    {icon || (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                        </svg>
                    )}
                </div>
                <div>
                    <h3 className={`font-bold mb-1 ${selected ? 'text-indigo-900' : 'text-slate-800'}`}>
                        {title}
                    </h3>
                    <p className={`text-sm leading-relaxed ${selected ? 'text-indigo-700' : 'text-slate-500'}`}>
                        {description}
                    </p>
                </div>
            </div>

            {selected && (
                <div className="absolute top-2 right-2">
                    <div className="bg-indigo-500 text-white rounded-full p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MethodCard;
