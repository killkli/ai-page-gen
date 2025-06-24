import React, { useState } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (apiKey: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave }: { isOpen: boolean; onSave: (apiKey: string) => void }) => {
  const [input, setInput] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-sky-700">請輸入 Gemini API 金鑰</h2>
        <input
          type="password"
          className="w-full border border-slate-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-sky-400"
          placeholder="請貼上您的 Gemini API Key..."
          value={input}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
        />
        <button
          className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 rounded transition"
          onClick={() => {
            if (input.trim()) {
              onSave(input.trim());
              setInput('');
            }
          }}
        >
          儲存金鑰
        </button>
        <p className="text-xs text-slate-500 mt-3">您的金鑰只會儲存在本機瀏覽器，不會上傳到伺服器。</p>
      </div>
    </div>
  );
};

export default ApiKeyModal; 