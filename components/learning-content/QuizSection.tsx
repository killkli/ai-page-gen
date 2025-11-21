import React from 'react';
import { ExtendedLearningContent, LearningLevel, VocabularyLevel, QuizCustomConfig, DEFAULT_QUIZ_CONFIG } from '../../src/core/types';
import DiagnosticQuizView from '../DiagnosticQuizView';
import QuizConfigPanel from '../QuizConfigPanel';
import QRCodeDisplay from '../QRCodeDisplay';
import { saveQuizContent } from '../../services/jsonbinService';
import { generateEncryptedApiKeyParam } from '../../utils/cryptoUtils';
import { regenerateQuizWithConfig } from '../../services/geminiService';

interface QuizSectionProps {
    content: ExtendedLearningContent;
    topic: string;
    apiKey?: string;
    selectedLevel?: LearningLevel | null;
    selectedVocabularyLevel?: VocabularyLevel;
    onContentUpdate?: (newContent: ExtendedLearningContent) => void;
}

const QuizSection: React.FC<QuizSectionProps> = ({
    content,
    topic,
    apiKey,
    selectedLevel,
    selectedVocabularyLevel,
    onContentUpdate
}) => {
    const [quizShareLoading, setQuizShareLoading] = React.useState(false);
    const [quizShareError, setQuizShareError] = React.useState('');
    const [quizShareUrl, setQuizShareUrl] = React.useState('');
    const [showQuizQRCode, setShowQuizQRCode] = React.useState(false);

    // Quiz configuration states
    const [quizConfig, setQuizConfig] = React.useState<QuizCustomConfig>(DEFAULT_QUIZ_CONFIG);
    const [isRegeneratingQuiz, setIsRegeneratingQuiz] = React.useState(false);
    const [showQuizConfig, setShowQuizConfig] = React.useState(false);

    const handleQuizShare = React.useCallback(async () => {
        setQuizShareLoading(true);
        setQuizShareError('');
        setQuizShareUrl('');

        if (!content.onlineInteractiveQuiz) {
            setQuizShareError('沒有可分享的測驗內容');
            setQuizShareLoading(false);
            return;
        }

        try {
            const binId = await saveQuizContent({
                quiz: content.onlineInteractiveQuiz,
                topic: topic,
                apiKey: apiKey, // 包含 API Key 以支援學習診斷
                metadata: {
                    selectedLevel: selectedLevel?.name,
                    selectedVocabularyLevel: selectedVocabularyLevel?.name,
                    createdAt: new Date().toISOString(),
                    supportsDiagnostic: !!apiKey
                }
            });

            // 生成包含加密 API Key 的 URL（如果有 API Key 的話）
            let url = `${window.location.origin}${import.meta.env.BASE_URL}quiz?binId=${binId}`;
            if (apiKey) {
                try {
                    const encryptedApiKeyParam = await generateEncryptedApiKeyParam(apiKey);
                    url += `&${encryptedApiKeyParam}`;
                } catch (error) {
                    console.warn('加密 API Key 失敗，將不包含 API Key:', error);
                }
            }

            setQuizShareUrl(url);
        } catch (e: any) {
            setQuizShareError(e.message || '分享測驗失敗');
        } finally {
            setQuizShareLoading(false);
        }
    }, [content.onlineInteractiveQuiz, topic, apiKey, selectedLevel, selectedVocabularyLevel]);

    const handleRegenerateQuiz = React.useCallback(async () => {
        if (!content.learningObjectives) {
            alert('無法重新生成測驗：缺少學習目標');
            return;
        }

        // 從 localStorage 獲取 API key（兼容多種 key 名稱）
        const storedApiKey = localStorage.getItem('gemini_api_key') || apiKey;
        if (!storedApiKey) {
            alert('請先設定 Gemini API 金鑰');
            return;
        }

        setIsRegeneratingQuiz(true);
        try {
            const newQuiz = await regenerateQuizWithConfig(
                topic,
                content.learningObjectives,
                quizConfig,
                selectedLevel,
                selectedVocabularyLevel
            );

            // 更新內容
            const updatedContent = {
                ...content,
                onlineInteractiveQuiz: newQuiz
            };

            // 如果有回調函數，使用它來更新父組件的狀態
            if (onContentUpdate) {
                onContentUpdate(updatedContent);
            }

            // 關閉配置面板
            setShowQuizConfig(false);

            // 顯示成功訊息
            alert('測驗已成功重新生成！');

        } catch (error: any) {
            console.error('重新生成測驗時發生錯誤:', error);
            alert('重新生成測驗失敗: ' + (error.message || '未知錯誤'));
        } finally {
            setIsRegeneratingQuiz(false);
        }
    }, [content, topic, apiKey, quizConfig, selectedLevel, selectedVocabularyLevel, onContentUpdate]);

    return (
        <div>
            <div className="flex flex-wrap justify-end items-center gap-2 mb-4">
                <button
                    onClick={handleQuizShare}
                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors flex items-center text-sm disabled:opacity-60"
                    aria-label="分享測驗給學生"
                    disabled={quizShareLoading}
                >
                    {quizShareLoading ? (
                        <span className="flex items-center"><span className="animate-spin mr-2">⏳</span> 分享中...</span>
                    ) : (
                        <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                            分享測驗
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setShowQuizConfig(!showQuizConfig)}
                    className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors flex items-center text-sm"
                    aria-label="測驗設定"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a6.759 6.759 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                    測驗設定
                </button>
            </div>

            {quizShareError && <span className="text-sm text-red-600">{quizShareError}</span>}

            {quizShareUrl && (
                <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm text-orange-700">測驗分享連結已生成：</p>
                        {apiKey && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                含 AI 診斷
                            </span>
                        )}
                    </div>
                    <div className="space-y-3">
                        {/* URL輸入框 */}
                        <input
                            type="text"
                            value={quizShareUrl}
                            readOnly
                            className="w-full px-3 py-2 bg-white border border-orange-300 rounded text-sm"
                            onClick={() => navigator.clipboard.writeText(quizShareUrl)}
                        />

                        {/* 按鈕區域 - 響應式佈局 */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <button
                                onClick={() => navigator.clipboard.writeText(quizShareUrl)}
                                className="flex-1 px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm flex items-center justify-center gap-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                                </svg>
                                複製連結
                            </button>
                            <button
                                onClick={() => setShowQuizQRCode(!showQuizQRCode)}
                                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center justify-center gap-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5H8.25v1.5H13.5V13.5ZM13.5 16.5H8.25V18H13.5v-1.5ZM16.5 16.5h1.5V18h-1.5v-1.5ZM16.5 13.5h1.5v1.5h-1.5v-1.5Z" />
                                </svg>
                                顯示 QR Code
                            </button>
                        </div>
                    </div>

                    {/* QR Code 顯示區域 */}
                    {showQuizQRCode && (
                        <div className="mt-4 flex justify-center">
                            <QRCodeDisplay
                                url={quizShareUrl}
                                title="測驗分享 QR Code"
                                size={200}
                                className="bg-white p-4 rounded-lg shadow-sm"
                            />
                        </div>
                    )}
                    {apiKey && (
                        <p className="text-xs text-orange-600 mt-2">
                            💡 此連結包含您的 API Key，學生可直接使用 AI 學習診斷功能
                        </p>
                    )}
                </div>
            )}
            {showQuizConfig && (
                <QuizConfigPanel
                    config={quizConfig}
                    onConfigChange={setQuizConfig}
                    onRegenerate={handleRegenerateQuiz}
                    isGenerating={isRegeneratingQuiz}
                />
            )}
            <DiagnosticQuizView
                quizzes={content.onlineInteractiveQuiz}
                topic={topic}
                apiKey={apiKey}
                enableDiagnostic={!!apiKey}
            />
        </div>
    );
};

export default QuizSection;
