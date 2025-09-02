import React from 'react';
import { CheckCircleIcon, XCircleIcon } from './icons';

interface QuestionResponse {
  questionId: string;
  questionType: string;
  userAnswer: any;
  correctAnswer: any;
  isCorrect: boolean;
  attempts?: number;
  timestamp?: string;
  difficulty?: string;
}

interface Props {
  responses: QuestionResponse[];
  quizContent?: any;
}

const EnhancedStudentResultsDisplay: React.FC<Props> = ({ responses, quizContent }) => {
  // 獲取原始題目內容
  const getOriginalQuestion = (response: QuestionResponse, index: number) => {
    if (!quizContent) return null;
    
    const questionType = response.questionType as keyof typeof quizContent;
    const questions = quizContent[questionType];
    
    if (!questions || !Array.isArray(questions)) return null;
    
    // 找到對應的題目 (根據 questionId 或 index)
    let questionIndex = index;
    if (response.questionId && typeof response.questionId === 'string') {
      const match = response.questionId.match(/\d+$/);
      if (match) {
        questionIndex = parseInt(match[0]);
      }
    }
    
    return questions[questionIndex] || null;
  };

  // 渲染原始題目內容
  const renderOriginalQuestion = (question: any, questionType: string) => {
    if (!question) return <div className="text-gray-400 italic">找不到原始題目</div>;
    
    switch (questionType) {
      case 'trueFalse':
        return (
          <div className="space-y-2">
            <div className="font-medium">📝 題目陳述:</div>
            <div className="bg-blue-50 p-3 rounded text-gray-800">{question.statement}</div>
            {question.explanation && (
              <div className="text-sm text-gray-600">
                <div className="font-medium">說明: </div>
                <div>{question.explanation}</div>
              </div>
            )}
          </div>
        );
      case 'multipleChoice':
        return (
          <div className="space-y-2">
            <div className="font-medium">❓ 題目:</div>
            <div className="bg-blue-50 p-3 rounded text-gray-800">{question.question}</div>
            <div className="font-medium">選項:</div>
            <div className="space-y-1">
              {question.options?.map((option: string, idx: number) => (
                <div 
                  key={idx} 
                  className={`p-2 rounded text-sm ${
                    idx === question.correctAnswerIndex 
                      ? 'bg-green-100 border border-green-300' 
                      : 'bg-gray-50'
                  }`}
                >
                  {String.fromCharCode(65 + idx)}. {option}
                  {idx === question.correctAnswerIndex && <span className="ml-2 text-green-600">✓ 正確答案</span>}
                </div>
              ))}
            </div>
          </div>
        );
      case 'fillInTheBlanks':
        return (
          <div className="space-y-2">
            <div className="font-medium">✏️ 填空題:</div>
            <div className="bg-blue-50 p-3 rounded text-gray-800">{question.sentence}</div>
            <div className="text-sm text-green-700">
              <span className="font-medium">正確答案: </span>
              {Array.isArray(question.correctAnswers) ? question.correctAnswers.join(', ') : question.correctAnswers}
            </div>
          </div>
        );
      case 'sentenceScramble':
        return (
          <div className="space-y-2">
            <div className="font-medium">🔀 句子重組:</div>
            <div className="text-sm text-gray-600">打亂的詞組:</div>
            <div className="bg-yellow-50 p-2 rounded text-sm">
              {Array.isArray(question.scrambledWords) ? question.scrambledWords.join(' | ') : '無詞組資料'}
            </div>
            <div className="text-sm text-green-700">
              <span className="font-medium">正確順序: </span>
              {question.correctSentence}
            </div>
          </div>
        );
      case 'memoryCardGame':
        return (
          <div className="space-y-2">
            <div className="font-medium">🃏 記憶卡遊戲:</div>
            {question.instructions && (
              <div className="text-sm text-sky-700 bg-sky-50 p-2 rounded">{question.instructions}</div>
            )}
            <div className="space-y-1">
              {question.pairs?.map((pair: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between bg-purple-50 p-2 rounded text-sm">
                  <span>🃏 {pair.question}</span>
                  <span className="text-purple-600">↔️</span>
                  <span>🃊 {pair.answer}</span>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return <pre className="text-xs bg-gray-100 p-2 rounded">{JSON.stringify(question, null, 2)}</pre>;
    }
  };

  // 格式化學生答案顯示
  const formatStudentAnswer = (answer: any, questionType: string) => {
    if (questionType === 'memoryCardGame') {
      if (typeof answer === 'number') {
        return `完成遊戲，總嘗試次數: ${answer}`;
      }
    }
    
    if (questionType === 'multipleChoice' && typeof answer === 'number') {
      // 將數字 0-3 轉換為 A-D 格式
      return `選項 ${String.fromCharCode(65 + answer)} (${answer})`;
    }
    
    if (typeof answer === 'object') {
      return JSON.stringify(answer, null, 2);
    }
    return String(answer);
  };

  const questionTypeLabels: {[key: string]: string} = {
    trueFalse: '是非題',
    multipleChoice: '選擇題', 
    fillInTheBlanks: '填空題',
    sentenceScramble: '句子重組',
    memoryCardGame: '翽卡配對遊戲'
  };

  return (
    <div className="space-y-6">
      {responses.map((response, index) => {
        const originalQuestion = getOriginalQuestion(response, index);
        
        return (
          <div 
            key={response.questionId || index}
            className={`p-6 rounded-lg border-2 ${
              response.isCorrect 
                ? 'border-green-200 bg-green-50' 
                : 'border-red-200 bg-red-50'
            }`}
          >
            {/* 題目標題 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {response.isCorrect ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircleIcon className="w-5 h-5 text-red-600" />
                )}
                <span className="font-bold text-lg text-gray-800">
                  第 {index + 1} 題 - {questionTypeLabels[response.questionType] || response.questionType}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {response.attempts && response.attempts > 1 && `嘗試 ${response.attempts} 次`}
              </div>
            </div>
            
            {/* 原始題目內容 */}
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">📖 原始題目內容:</div>
              <div className="border-l-4 border-blue-300 pl-4">
                {renderOriginalQuestion(originalQuestion, response.questionType)}
              </div>
            </div>
            
            {/* 學生作答與結果 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">👨‍🎓 學生作答:</div>
                <div className="bg-white p-3 rounded border">
                  {formatStudentAnswer(response.userAnswer, response.questionType)}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">
                  {response.isCorrect ? '✅ 答題正確' : '❌ 答題錯誤'}
                </div>
                <div className={`p-3 rounded border ${
                  response.isCorrect ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'
                }`}>
                  {response.isCorrect ? '學生答案正確！' : '需要進一步指導'}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EnhancedStudentResultsDisplay;