import React from 'react';
import { WritingPracticeContent, LearningLevel, VocabularyLevel } from '../../src/core/types';
import WritingPracticeView from '../WritingPracticeView';
import QRCodeDisplay from '../QRCodeDisplay';
import { saveWritingPracticeContent } from '../../services/jsonbinService';
import { generateEncryptedApiKeyParam } from '../../utils/cryptoUtils';

interface WritingPracticeSectionProps {
    writingPractice?: WritingPracticeContent;
    topic: string;
    apiKey?: string;
    selectedLevel?: LearningLevel | null;
    selectedVocabularyLevel?: VocabularyLevel;
}

const WritingPracticeSection: React.FC<WritingPracticeSectionProps> = ({
    writingPractice,
    topic,
    apiKey,
    selectedLevel,
    selectedVocabularyLevel
}) => {
    const [writingShareLoading, setWritingShareLoading] = React.useState(false);
    const [writingShareError, setWritingShareError] = React.useState('');
    const [writingShareUrl, setWritingShareUrl] = React.useState('');
    const [showWritingQRCode, setShowWritingQRCode] = React.useState(false);

    const handleWritingShare = React.useCallback(async () => {
        setWritingShareLoading(true);
        setWritingShareError('');
        setWritingShareUrl('');

        if (!writingPractice) {
            setWritingShareError('沒有可分享的寫作練習內容');
            setWritingShareLoading(false);
            return;
        }

        try {
            const binId = await saveWritingPracticeContent({
                writingPractice: writingPractice,
                topic: topic,
                metadata: {
                    selectedLevel: selectedLevel?.name,
                    selectedVocabularyLevel: selectedVocabularyLevel?.name,
                    createdAt: new Date().toISOString()
                }
            });

            // 生成包含加密 API Key 的 URL（如果有 API Key 的話）
            let url = `${window.location.origin}${import.meta.env.BASE_URL}writing?binId=${binId}`;
            if (apiKey) {
                try {
                    const encryptedApiKeyParam = await generateEncryptedApiKeyParam(apiKey);
                    url += `&${encryptedApiKeyParam}`;
                } catch (error) {
                    console.warn('加密 API Key 失敗，將不包含 API Key:', error);
                }
            }

            setWritingShareUrl(url);
        } catch (e: any) {
            setWritingShareError(e.message || '分享寫作練習失敗');
        } finally {
            setWritingShareLoading(false);
        }
    }, [writingPractice, topic, apiKey, selectedLevel, selectedVocabularyLevel]);

    return (
        <div>
            {writingPractice ? (
                <div>
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={handleWritingShare}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm"
                            disabled={writingShareLoading}
                        >
                            {writingShareLoading ? (
                                <>
                                    <span className="animate-spin">⏳</span>
                                    分享中...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.935-2.186 2.25 2.25 0 0 0-3.935 2.186Z" />
                                    </svg>
                                    分享寫作練習
                                </>
                            )}
                        </button>
                    </div>

                    {writingShareError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{writingShareError}</div>}

                    {writingShareUrl && (
                        <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <p className="text-sm text-purple-700">寫作練習分享連結已生成：</p>
                                {apiKey && (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                        含 AI 批改
                                    </span>
                                )}
                            </div>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={writingShareUrl}
                                    readOnly
                                    className="w-full px-3 py-2 bg-white border border-purple-300 rounded text-sm"
                                    onClick={() => navigator.clipboard.writeText(writingShareUrl)}
                                />
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                    <button
                                        onClick={() => navigator.clipboard.writeText(writingShareUrl)}
                                        className="flex-1 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm transition-colors"
                                    >
                                        複製連結
                                    </button>
                                    <button
                                        onClick={() => setShowWritingQRCode(!showWritingQRCode)}
                                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center justify-center gap-1 transition-colors"
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
                            {showWritingQRCode && (
                                <div className="mt-4 flex justify-center">
                                    <QRCodeDisplay
                                        url={writingShareUrl}
                                        title="寫作練習分享 QR Code"
                                        size={200}
                                        className="bg-white p-4 rounded-lg shadow-sm"
                                    />
                                </div>
                            )}
                            {apiKey && (
                                <p className="text-xs text-purple-600 mt-2">
                                    💡 此連結包含您的 API Key，學生可直接使用 AI 批改功能
                                </p>
                            )}
                        </div>
                    )}

                    <WritingPracticeView
                        content={writingPractice}
                        apiKey={apiKey}
                        vocabularyLevel={selectedVocabularyLevel || undefined}
                    />
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-400 mx-auto mb-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">沒有提供寫作練習</h4>
                    <p className="text-gray-500">此主題沒有生成寫作練習內容</p>
                </div>
            )}
        </div>
    );
};

export default WritingPracticeSection;
