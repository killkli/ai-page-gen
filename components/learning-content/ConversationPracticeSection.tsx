import React from 'react';
import { DialogueLine, LearningObjectiveItem, ContentBreakdownItem, LearningLevel, VocabularyLevel } from '../../src/core/types';
import SectionCard from '../SectionCard';
import { ChatBubbleLeftRightIcon } from '../icons';
import ConversationPractice from '../ConversationPractice';
import QRCodeDisplay from '../QRCodeDisplay';
import { conversationService } from '../../services/conversationService';
import { saveConversationPracticeContent } from '../../services/jsonbinService';

interface ConversationPracticeSectionProps {
    englishConversation?: DialogueLine[];
    learningObjectives?: LearningObjectiveItem[];
    contentBreakdown?: ContentBreakdownItem[];
    topic: string;
    apiKey?: string;
    selectedLevel?: LearningLevel | null;
    selectedVocabularyLevel?: VocabularyLevel;
}

const ConversationPracticeSection: React.FC<ConversationPracticeSectionProps> = ({
    englishConversation,
    learningObjectives,
    contentBreakdown,
    topic,
    apiKey,
    selectedLevel,
    selectedVocabularyLevel
}) => {
    // Advanced conversation practice sharing states
    const [advancedConversationLoading, setAdvancedConversationLoading] = React.useState(false);
    const [advancedConversationError, setAdvancedConversationError] = React.useState('');
    const [advancedConversationUrl, setAdvancedConversationUrl] = React.useState('');
    const [showAdvancedConversationQRCode, setShowAdvancedConversationQRCode] = React.useState(false);

    const handleAdvancedConversationGeneration = React.useCallback(async () => {
        if (!apiKey) {
            setAdvancedConversationError('請先設定 Gemini API 金鑰');
            return;
        }

        if (!learningObjectives || learningObjectives.length === 0) {
            setAdvancedConversationError('無法生成對話練習：缺少學習目標');
            return;
        }

        setAdvancedConversationLoading(true);
        setAdvancedConversationError('');
        setAdvancedConversationUrl('');

        try {
            // 基於教案內容創建對話生成選項
            const conversationOptions = {
                topic: topic,
                scenario: `Practice conversation based on learning objectives: ${learningObjectives.map(obj => obj.objective).join(', ')}`,
                difficulty: selectedLevel?.name === '入門' ? 'easy' as const :
                    selectedLevel?.name === '進階' ? 'hard' as const :
                        'normal' as const,
                participantCount: 2 as const,
                duration: 10,
                focusAreas: learningObjectives.map(obj => obj.objective),
                culturalContext: contentBreakdown?.map(item => item.details).join('; ')
            };

            // 生成對話練習
            const conversationPractice = await conversationService.generateConversationPractice(
                conversationOptions,
                apiKey
            );

            // 儲存到分享系統
            const shareData = {
                practice: conversationPractice,
                metadata: {
                    basedOnTopic: topic,
                    createdFrom: 'lesson-plan',
                    selectedLevel: selectedLevel?.name,
                    selectedVocabularyLevel: selectedVocabularyLevel?.name,
                    createdAt: new Date().toISOString()
                }
            };

            const binId = await saveConversationPracticeContent(shareData);
            const url = `${window.location.origin}${import.meta.env.BASE_URL}conversation-practice/${binId}`;

            setAdvancedConversationUrl(url);

        } catch (error: any) {
            console.error('Failed to generate advanced conversation practice:', error);
            setAdvancedConversationError(error.message || '生成進階對話練習失敗');
        } finally {
            setAdvancedConversationLoading(false);
        }
    }, [apiKey, learningObjectives, contentBreakdown, topic, selectedLevel, selectedVocabularyLevel]);

    return (
        <SectionCard title="對話練習" icon={<ChatBubbleLeftRightIcon className="w-7 h-7" />}>
            {englishConversation && englishConversation.length > 0 ? (
                <div>
                    {/* 基礎對話練習 */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">基礎對話練習</h3>
                        <ConversationPractice dialogue={englishConversation} />
                    </div>

                    {/* 進階對話練習生成 */}
                    {apiKey && (
                        <div className="border-t pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">進階互動對話練習</h3>
                                    <p className="text-sm text-gray-600 mt-1">基於教案內容生成豐富的對話練習，包含語音識別和AI評估</p>
                                </div>
                                <button
                                    onClick={handleAdvancedConversationGeneration}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 text-sm"
                                    disabled={advancedConversationLoading || !apiKey}
                                >
                                    {advancedConversationLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                            生成中...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                                            </svg>
                                            生成進階對話練習
                                        </>
                                    )}
                                </button>
                            </div>

                            {advancedConversationError && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                    {advancedConversationError}
                                </div>
                            )}

                            {advancedConversationUrl && (
                                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="text-sm font-medium text-green-800 mb-1">進階對話練習已生成！</div>
                                            <div className="text-xs text-green-600">學生可使用此連結進行互動對話練習</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => navigator.clipboard.writeText(advancedConversationUrl)}
                                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                            >
                                                複製連結
                                            </button>
                                            <button
                                                onClick={() => setShowAdvancedConversationQRCode(!showAdvancedConversationQRCode)}
                                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                            >
                                                QR Code
                                            </button>
                                        </div>
                                    </div>

                                    {showAdvancedConversationQRCode && (
                                        <div className="mt-4 pt-4 border-t border-green-200">
                                            <QRCodeDisplay url={advancedConversationUrl} title={`${topic} - 進階對話練習`} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">沒有提供基礎對話練習。</p>
                    {apiKey && (
                        <div>
                            <p className="text-sm text-gray-500 mb-4">您可以基於教案內容生成進階對話練習</p>
                            <button
                                onClick={handleAdvancedConversationGeneration}
                                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 mx-auto"
                                disabled={advancedConversationLoading}
                            >
                                {advancedConversationLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        生成中...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                                        </svg>
                                        生成進階對話練習
                                    </>
                                )}
                            </button>

                            {advancedConversationError && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm max-w-md mx-auto">
                                    {advancedConversationError}
                                </div>
                            )}

                            {advancedConversationUrl && (
                                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg max-w-md mx-auto">
                                    <div className="text-sm font-medium text-green-800 mb-2">進階對話練習已生成！</div>
                                    <div className="flex gap-2 justify-center">
                                        <button
                                            onClick={() => navigator.clipboard.writeText(advancedConversationUrl)}
                                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                        >
                                            複製連結
                                        </button>
                                        <button
                                            onClick={() => setShowAdvancedConversationQRCode(!showAdvancedConversationQRCode)}
                                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                        >
                                            QR Code
                                        </button>
                                    </div>

                                    {showAdvancedConversationQRCode && (
                                        <div className="mt-4 pt-4 border-t border-green-200">
                                            <QRCodeDisplay url={advancedConversationUrl} title={`${topic} - 進階對話練習`} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </SectionCard>
    );
};

export default ConversationPracticeSection;
