import React from 'react';

interface Tab {
  label: string;
  key: string;
}

interface TabsProps {
  tabs: Tab[];
  current: string;
  onChange: (key: string) => void;
  children: React.ReactNode[];
}

const Tabs: React.FC<TabsProps> = React.memo(({ tabs, current, onChange, children }) => {
  return (
    <div>
      <div className="flex border-b mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 -mb-px border-b-2 font-medium transition-colors focus:outline-none ${current === tab.key
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-indigo-600'
              }`}
            onClick={() => onChange(tab.key)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{children[tabs.findIndex((t) => t.key === current)]}</div>
    </div>
  );
});

export default Tabs; 