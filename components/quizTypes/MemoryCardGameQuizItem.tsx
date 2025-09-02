import React, { useState, useEffect } from 'react';
import { MemoryCardGameQuestion } from '../../types';

interface MemoryCardGameQuizItemProps {
  question: MemoryCardGameQuestion;
  itemNumber: number;
  onAnswer?: (userAnswer: any, isCorrect: boolean) => void;
}

interface CardData {
  id: number;
  content: string;
  pairId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const MemoryCardGameQuizItem: React.FC<MemoryCardGameQuizItemProps> = ({ question, itemNumber, onAnswer }) => {
  // 將每對拆成兩張卡，隨機排列
  const [cards, setCards] = useState<CardData[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [attempts, setAttempts] = useState(0); // 記錄嘗試次數（翻卡次數）
  const [gameCompleted, setGameCompleted] = useState(false); // 避免重複觸發

  useEffect(() => {
    let id = 0;
    const cardList: CardData[] = (question.pairs || []).flatMap((pair, idx) => [
      { id: id++, content: pair.question, pairId: idx, isFlipped: false, isMatched: false },
      { id: id++, content: pair.answer, pairId: idx, isFlipped: false, isMatched: false },
    ]);
    setCards(shuffleArray(cardList));
    setFlippedIndices([]);
    setMatchedCount(0);
    setAttempts(0);
    setGameCompleted(false);
  }, [question]);

  const handleCardClick = (index: number) => {
    if (cards[index].isFlipped || cards[index].isMatched || flippedIndices.length === 2 || gameCompleted) return;
    const newCards = cards.map((card, i) => i === index ? { ...card, isFlipped: true } : card);
    const newFlipped = [...flippedIndices, index];
    setCards(newCards);
    setFlippedIndices(newFlipped);
    
    // 當翻開第二張卡時，計算一次嘗試
    if (newFlipped.length === 2) {
      setAttempts(prev => prev + 1);
    }

    if (newFlipped.length === 2) {
      const [firstIdx, secondIdx] = newFlipped;
      if (newCards[firstIdx].pairId === newCards[secondIdx].pairId) {
        // 配對成功
        setTimeout(() => {
          setCards(cards => cards.map((card, i) =>
            i === firstIdx || i === secondIdx ? { ...card, isMatched: true } : card
          ));
          setFlippedIndices([]);
          setMatchedCount(count => count + 1);
        }, 600);
      } else {
        // 配對失敗
        setTimeout(() => {
          setCards(cards => cards.map((card, i) =>
            i === firstIdx || i === secondIdx ? { ...card, isFlipped: false } : card
          ));
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  const allMatched = matchedCount === (question.pairs || []).length;

  // 遊戲完成時呼叫診斷回調（只觸發一次）
  useEffect(() => {
    if (allMatched && !gameCompleted && onAnswer) {
      setGameCompleted(true);
      // 記憶卡遊戲完成視為答對，用嘗試次數作為 userAnswer
      onAnswer(attempts, true);
    }
  }, [allMatched, gameCompleted, attempts, onAnswer]);

  return (
    <div className="mb-4 p-4 border rounded bg-slate-50">
      <div className="font-semibold mb-2">{itemNumber}. 翻卡牌記憶遊戲</div>
      {question.instructions && (
        <div className="mb-2 text-sky-700 text-sm">{question.instructions}</div>
      )}
      <div className="mb-3 text-sm text-gray-600 flex justify-between items-center">
        <span>配對進度: {matchedCount}/{(question.pairs || []).length}</span>
        <span>嘗試次數: {attempts}</span>
        {allMatched && (
          <span className="text-green-600 font-medium">✅ 遊戲完成！</span>
        )}
      </div>
      <div className="grid grid-cols-4 gap-3 max-w-xl mx-auto mb-2">
        {cards.map((card, idx) => (
          <button
            key={card.id}
            className={`relative h-20 w-full rounded shadow border transition-transform duration-200 ${card.isMatched ? 'bg-green-200 border-green-400' : 'bg-white border-slate-300'} ${card.isFlipped || card.isMatched ? '' : 'hover:scale-105'}`}
            onClick={() => handleCardClick(idx)}
            disabled={card.isFlipped || card.isMatched || flippedIndices.length === 2}
            style={{ perspective: '600px' }}
          >
            <div className={`absolute inset-0 flex items-center justify-center text-base font-medium transition-all duration-300 ${card.isFlipped || card.isMatched ? 'opacity-100 rotate-y-0' : 'opacity-0 rotate-y-180'}`}
              style={{ backfaceVisibility: 'hidden', transform: card.isFlipped || card.isMatched ? 'rotateY(0deg)' : 'rotateY(180deg)' }}>
              {card.content}
            </div>
            <div className={`absolute inset-0 flex items-center justify-center text-2xl font-bold text-sky-600 transition-all duration-300 ${card.isFlipped || card.isMatched ? 'opacity-0 rotate-y-180' : 'opacity-100 rotate-y-0'}`}
              style={{ backfaceVisibility: 'hidden', transform: card.isFlipped || card.isMatched ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
              ?
            </div>
          </button>
        ))}
      </div>
      {allMatched && (
        <div className="text-green-600 font-semibold mt-2">恭喜！全部配對成功！</div>
      )}
    </div>
  );
};

export default MemoryCardGameQuizItem; 