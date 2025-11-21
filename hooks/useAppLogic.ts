import { useState, useCallback, useEffect } from 'react';
import {
    ExtendedLearningContent,
    LearningLevel,
    VocabularyLevel,
    LearningLevelSuggestions
} from '../src/core/types';
import {
    hasConfiguredProviders,
    generateLearningPlan,
    generateLearningPlanWithLevel,
    generateLearningPlanWithVocabularyLevel,
    generateLearningLevelSuggestions,
    isEnglishRelatedTopic,
    initializeProviderSystem
} from '../services/geminiServiceAdapter';
import { providerService } from '../services/providerService';
import { lessonPlanStorage, createStoredLessonPlan } from '../services/lessonPlanStorage';
import { ProviderSharingService } from '../services/providerSharingService';
import { VOCABULARY_LEVELS } from '../consts';

const LOCALSTORAGE_KEY = 'gemini_api_key';
let providerSystemInitialized = false;

export const useAppLogic = () => {
    const [topic, setTopic] = useState<string>('');
    const [generatedContent, setGeneratedContent] = useState<ExtendedLearningContent | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
    const [copySuccess, setCopySuccess] = useState<string | null>(null);

    // 新的分享功能狀態
    const [showProviderShareModal, setShowProviderShareModal] = useState<boolean>(false);
    const [availableProviders, setAvailableProviders] = useState<any[]>([]);

    // 新增：程度建議相關狀態
    const [learningLevels, setLearningLevels] = useState<LearningLevelSuggestions | null>(null);
    const [selectedLevel, setSelectedLevel] = useState<LearningLevel | null>(null);
    const [showingLevelSelection, setShowingLevelSelection] = useState<boolean>(false);

    // 新增：單字程度相關狀態 (僅適用於英語主題)
    const [selectedVocabularyLevel, setSelectedVocabularyLevel] = useState<VocabularyLevel>(VOCABULARY_LEVELS[0]);
    const [showingVocabularySelection, setShowingVocabularySelection] = useState<boolean>(false);
    const [isEnglishTopic, setIsEnglishTopic] = useState<boolean>(false);

    // 新增：Provider 分享狀態
    const [providerShareId, setProviderShareId] = useState<string | null>(null);

    // 新增：通用生成器顯示狀態
    const [showGeneralGenerator, setShowGeneralGenerator] = useState<boolean>(false);

    useEffect(() => {
        const initializeApp = async () => {
            // 1. 先檢查 URL 參數
            const shareInfo = ProviderSharingService.parseShareUrl();

            // 處理舊版 API Key 分享
            if (shareInfo.type === 'legacy' && shareInfo.value) {
                localStorage.setItem(LOCALSTORAGE_KEY, shareInfo.value);
                setApiKey(shareInfo.value);
                setShowApiKeyModal(false);
                // 清除網址參數但不刷新頁面
                const cleanUrl = window.location.origin + window.location.pathname;
                window.history.replaceState({}, document.title, cleanUrl);
                return;
            }

            // 2. 初始化 Provider 系統（對所有情況都需要，包括 provider 分享）
            if (!providerSystemInitialized) {
                try {
                    await initializeProviderSystem();
                    providerSystemInitialized = true;
                } catch (error) {
                    console.error('Provider 系統初始化失敗:', error);
                }
            }

            // 3. 如果是 provider 分享，設置狀態並初始化相關功能
            if (shareInfo.type === 'provider' && shareInfo.value) {
                setProviderShareId(shareInfo.value);
                // 載入可用的 Providers（provider 分享時也需要）
                try {
                    const providers = await providerService.getProviders();
                    setAvailableProviders(providers);
                } catch (error) {
                    console.error('載入 Providers 失敗:', error);
                }
                return;
            }

            // 4. 一般應用初始化：檢查 localStorage
            const storedKey = localStorage.getItem(LOCALSTORAGE_KEY);
            if (storedKey) {
                setApiKey(storedKey);
            } else {
                // 檢查是否有配置的 Provider (新系統)
                const hasProviders = await hasConfiguredProviders().catch(() => false);

                if (!hasProviders) {
                    setShowApiKeyModal(true);
                }
            }

            // 載入可用的 Providers
            try {
                const providers = await providerService.getProviders();
                setAvailableProviders(providers);
            } catch (error) {
                console.error('載入 Providers 失敗:', error);
            }
        };

        initializeApp();
    }, []);

    const handleSaveApiKey = (key: string) => {
        localStorage.setItem(LOCALSTORAGE_KEY, key);
        setApiKey(key);
        setShowApiKeyModal(false);
    };

    // 保存教案到本地存儲
    const saveToLocalStorage = async (content: ExtendedLearningContent, currentTopic: string) => {
        try {
            await lessonPlanStorage.init();
            const storedPlan = createStoredLessonPlan(currentTopic, content);
            await lessonPlanStorage.saveLessonPlan(storedPlan);
        } catch (error) {
            console.error('保存教案到本地存儲失敗:', error);
            // 不影響用戶體驗，只記錄錯誤
        }
    };

    // 第一階段：產生程度建議
    const handleGenerateLevelSuggestions = useCallback(async () => {
        if (!topic.trim()) {
            setError('請輸入學習主題。');
            return;
        }

        // 檢查是否有配置的 Provider 或舊版 API Key
        const hasProviders = await providerService.hasConfiguredProviders();
        if (!hasProviders && !apiKey) {
            setError('請先配置 AI Provider 或設定 API 金鑰。');
            setShowApiKeyModal(true);
            return;
        }

        setIsLoading(true);
        setError(null);
        setLearningLevels(null);
        setGeneratedContent(null);
        setSelectedLevel(null);
        setSelectedVocabularyLevel(VOCABULARY_LEVELS[0]);
        setShowingVocabularySelection(false);

        // 檢測是否為英語相關主題
        const englishTopic = isEnglishRelatedTopic(topic);
        setIsEnglishTopic(englishTopic);

        try {
            // 使用 provider system 或 fallback 到舊版 API key
            const effectiveApiKey = hasProviders ? 'provider-system-placeholder-key' : '';
            const levels = await generateLearningLevelSuggestions(topic, effectiveApiKey);
            setLearningLevels(levels);
            setShowingLevelSelection(true);

            // 如果是英語主題，也要顯示單字程度選擇器
            if (englishTopic) {
                setShowingVocabularySelection(true);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || '產生學習程度建議時發生未知錯誤。');
        } finally {
            setIsLoading(false);
        }
    }, [topic, apiKey]);

    // 第二階段：根據選定程度產生完整內容
    const handleGenerateContentWithLevel = useCallback(async (level: LearningLevel) => {
        // 檢查是否有配置的 Provider 或舊版 API Key
        const hasProviders = await providerService.hasConfiguredProviders();
        if (!hasProviders && !apiKey) {
            setError('請先配置 AI Provider 或設定 API 金鑰。');
            setShowApiKeyModal(true);
            return;
        }

        // 如果是英語主題但未選擇單字程度，顯示錯誤
        if (isEnglishTopic && !selectedVocabularyLevel) {
            setError('請先選擇英語單字程度。');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSelectedLevel(level);
        setGeneratedContent(null);

        try {
            let content: ExtendedLearningContent;

            // 使用 provider system 或 fallback 到舊版 API key
            const effectiveApiKey = hasProviders ? 'provider-system-placeholder-key' : apiKey;
            if (effectiveApiKey === null) throw new Error('無API KEY 可用！')

            // 根據是否為英語主題選擇不同的生成方式
            if (isEnglishTopic && selectedVocabularyLevel) {
                content = await generateLearningPlanWithVocabularyLevel(topic, level, selectedVocabularyLevel, effectiveApiKey);
            } else {
                content = await generateLearningPlanWithLevel(topic, level, effectiveApiKey);
            }

            setGeneratedContent(content);
            setShowingLevelSelection(false);
            setShowingVocabularySelection(false);

            // 自動保存到本地存儲
            await saveToLocalStorage(content, topic);
        } catch (err: any) {
            console.error(err);
            setError(err.message || '產生學習內容時發生未知錯誤。');
        } finally {
            setIsLoading(false);
        }
    }, [topic, apiKey, isEnglishTopic, selectedVocabularyLevel]);

    // 保留原來的函數作為快速生成選項
    const handleGenerateContent = useCallback(async () => {
        if (!topic.trim()) {
            setError('請輸入學習主題。');
            return;
        }

        // 檢查是否有配置的 Provider 或舊版 API Key
        const hasProviders = await providerService.hasConfiguredProviders();
        if (!hasProviders && !apiKey) {
            setError('請先配置 AI Provider 或設定 API 金鑰。');
            setShowApiKeyModal(true);
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedContent(null);
        setShowingLevelSelection(false);
        setShowingVocabularySelection(false);
        setIsEnglishTopic(false);

        try {
            // 使用 provider system 或 fallback 到舊版 API key
            const effectiveApiKey = hasProviders ? 'provider-system-placeholder-key' : '';
            const content = await generateLearningPlan(topic, effectiveApiKey);
            setGeneratedContent(content);

            // 自動保存到本地存儲
            await saveToLocalStorage(content, topic);
        } catch (err: any) {
            console.error(err);
            setError(err.message || '產生內容時發生未知錯誤。');
            setGeneratedContent(null);
        } finally {
            setIsLoading(false);
        }
    }, [topic, apiKey]);

    // 數學生成完成處理
    const handleMathComplete = useCallback(async (content: ExtendedLearningContent, topicSummary: string) => {
        setGeneratedContent(content);
        setTopic(topicSummary);
        await saveToLocalStorage(content, topicSummary);
        setIsLoading(false);
    }, []);

    // 英語生成完成處理
    const handleEnglishComplete = useCallback(async (content: ExtendedLearningContent, topicSummary: string) => {
        setGeneratedContent(content);
        setTopic(topicSummary);
        setIsEnglishTopic(true);
        await saveToLocalStorage(content, topicSummary);
        setIsLoading(false);
    }, []);

    // 舊版 API Key 分享（向後兼容）
    const handleShareLink = async () => {
        if (!apiKey) {
            setCopySuccess('請先設定 API 金鑰');
            return;
        }
        const url = ProviderSharingService.createLegacyShare(apiKey);
        try {
            await navigator.clipboard.writeText(url);
            setCopySuccess('已複製分享連結！');
        } catch {
            setCopySuccess('複製失敗，請手動複製');
        }
        setTimeout(() => setCopySuccess(null), 2000);
    };

    // 新版 Provider 配置分享
    const handleProviderShare = useCallback(() => {
        setShowProviderShareModal(true);
    }, []);

    const handleProviderShareCreated = useCallback((_shareUrl: string) => {
        setCopySuccess('Provider 配置分享已創建！');
        setShowProviderShareModal(false);
        setTimeout(() => setCopySuccess(null), 3000);
    }, []);

    // Provider 分享導入完成處理
    const handleProviderImported = useCallback((count: number) => {
        console.log(`已導入 ${count} 個 Provider 配置`);
        // 導入完成後跳轉回主頁
        window.location.href = `${window.location.origin}${import.meta.env.BASE_URL} `;
    }, []);

    return {
        topic, setTopic,
        generatedContent, setGeneratedContent,
        isLoading, setIsLoading,
        error, setError,
        apiKey, setApiKey,
        showApiKeyModal, setShowApiKeyModal,
        copySuccess, setCopySuccess,
        showProviderShareModal, setShowProviderShareModal,
        availableProviders, setAvailableProviders,
        learningLevels, setLearningLevels,
        selectedLevel, setSelectedLevel,
        showingLevelSelection, setShowingLevelSelection,
        selectedVocabularyLevel, setSelectedVocabularyLevel,
        showingVocabularySelection, setShowingVocabularySelection,
        isEnglishTopic, setIsEnglishTopic,
        providerShareId, setProviderShareId,
        showGeneralGenerator, setShowGeneralGenerator,
        handleSaveApiKey,
        handleGenerateLevelSuggestions,
        handleGenerateContentWithLevel,
        handleGenerateContent,
        handleMathComplete,
        handleEnglishComplete,
        handleShareLink,
        handleProviderShare,
        handleProviderShareCreated,
        handleProviderImported
    };
};
