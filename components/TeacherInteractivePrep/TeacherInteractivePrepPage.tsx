import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ExtendedLearningContent } from '../../types';
import { getLearningContent, saveLearningContent } from '../../services/jsonbinService';
import { lessonPlanStorage } from '../../services/lessonPlanStorage';
import { transformLearningObjectiveForStudent, transformContentBreakdownForStudent, transformConfusingPointForStudent, generateStepQuiz } from '../../services/geminiServiceAdapter';
import { interactiveContentStorage, TransformedVersion } from '../../services/interactiveContentStorage';
import LoadingSpinner from '../LoadingSpinner';
import MarkdownRenderer from '../MarkdownRenderer';

// 定義轉換狀態類型
type TransformationState = {
  [key: string]: {
    original: any;
    transformed: any | null;
    isTransformed: boolean;
    isTransforming: boolean;
    quiz: any | null;
    hasQuiz: boolean;
    isGeneratingQuiz: boolean;
  };
};

// 定義學習步驟類型
type PrepStep = {
  id: string;
  title: string;
  type: 'objective' | 'breakdown' | 'confusing';
  icon: string;
  data: any;
  index: number;
};

const TeacherInteractivePrepPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const contentId = searchParams.get('contentId');
  const binId = searchParams.get('binId');
  
  const [content, setContent] = useState<ExtendedLearningContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [prepSteps, setPrepSteps] = useState<PrepStep[]>([]);
  const [transformations, setTransformations] = useState<TransformationState>({});
  const [publishStatus, setPublishStatus] = useState<'idle' | 'publishing' | 'published' | 'error'>('idle');
  const [publishedUrl, setPublishedUrl] = useState<string>('');
  
  // 批次轉換相關狀態
  const [batchTransformStatus, setBatchTransformStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
  const [batchProgress, setBatchProgress] = useState<{current: number, total: number, currentStep?: string}>({current: 0, total: 0});
  
  // 選擇性轉換狀態
  const [selectedSteps, setSelectedSteps] = useState<Set<string>>(new Set());
  
  // 版本管理狀態
  const [availableVersions, setAvailableVersions] = useState<TransformedVersion[]>([]);
  const [currentVersionId, setCurrentVersionId] = useState<string | null>(null);
  const [showVersionSelector, setShowVersionSelector] = useState(false);
  const [saveVersionName, setSaveVersionName] = useState('');

  // 測驗設定狀態
  const [showQuizSettings, setShowQuizSettings] = useState(false);
  const [quizSettingsStepId, setQuizSettingsStepId] = useState<string>('');
  const [quizConfig, setQuizConfig] = useState({
    trueFalse: 3,
    multipleChoice: 3,
    memoryCardGame: 1
  });
  
  // 測驗預覽狀態
  const [showQuizPreview, setShowQuizPreview] = useState(false);
  const [previewQuizData, setPreviewQuizData] = useState<any>(null);
  const [previewStepId, setPreviewStepId] = useState<string>('');

  useEffect(() => {
    loadContent();
  }, [contentId, binId]);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);

      let loadedContent: ExtendedLearningContent;

      if (binId) {
        loadedContent = await getLearningContent(binId);
      } else if (contentId) {
        await lessonPlanStorage.init();
        const lessonPlan = await lessonPlanStorage.getLessonPlan(contentId);
        if (!lessonPlan) {
          throw new Error('找不到指定的教案');
        }
        
        loadedContent = {
          topic: lessonPlan.topic,
          learningObjectives: lessonPlan.content.learningObjectives,
          contentBreakdown: lessonPlan.content.contentBreakdown,
          confusingPoints: lessonPlan.content.confusingPoints,
          classroomActivities: lessonPlan.content.classroomActivities,
          onlineInteractiveQuiz: lessonPlan.content.quiz,
          writingPractice: lessonPlan.content.writingPractice,
        };
      } else {
        throw new Error('缺少必要參數：contentId 或 binId');
      }

      setContent(loadedContent);
      initializePrepSteps(loadedContent);
      
      // 加載現有版本（如果有的話）
      const effectiveContentId = getEffectiveContentId();
      if (effectiveContentId) {
        await loadExistingVersions(effectiveContentId);
      }
      
    } catch (err: any) {
      console.error('載入內容失敗:', err);
      setError(err.message || '載入內容時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const initializePrepSteps = (content: ExtendedLearningContent) => {
    const steps: PrepStep[] = [];
    const initialTransformations: TransformationState = {};
    
    // 學習目標
    if (content.learningObjectives && content.learningObjectives.length > 0) {
      content.learningObjectives.forEach((objective, index) => {
        const stepId = `objective_${index}`;
        steps.push({
          id: stepId,
          title: `學習目標 ${index + 1}`,
          type: 'objective',
          icon: '🎯',
          data: objective,
          index
        });
        
        initialTransformations[stepId] = {
          original: objective,
          transformed: null,
          isTransformed: false,
          isTransforming: false,
          quiz: null,
          hasQuiz: false,
          isGeneratingQuiz: false
        };
      });
    }
    
    // 內容分解
    if (content.contentBreakdown && content.contentBreakdown.length > 0) {
      content.contentBreakdown.forEach((item, index) => {
        const stepId = `breakdown_${index}`;
        steps.push({
          id: stepId,
          title: `深度學習 ${index + 1}`,
          type: 'breakdown',
          icon: '📖',
          data: item,
          index
        });
        
        initialTransformations[stepId] = {
          original: item,
          transformed: null,
          isTransformed: false,
          isTransforming: false,
          quiz: null,
          hasQuiz: false,
          isGeneratingQuiz: false
        };
      });
    }
    
    // 易混淆點
    if (content.confusingPoints && content.confusingPoints.length > 0) {
      content.confusingPoints.forEach((item, index) => {
        const stepId = `confusing_${index}`;
        steps.push({
          id: stepId,
          title: `易混淆點 ${index + 1}`,
          type: 'confusing',
          icon: '⚡',
          data: item,
          index
        });
        
        initialTransformations[stepId] = {
          original: item,
          transformed: null,
          isTransformed: false,
          isTransforming: false,
          quiz: null,
          hasQuiz: false,
          isGeneratingQuiz: false
        };
      });
    }
    
    setPrepSteps(steps);
    setTransformations(initialTransformations);
  };

  // 獲取 API 金鑰
  const getApiKey = () => {
    return localStorage.getItem('gemini_api_key') || '';
  };

  // 轉換內容
  const transformStep = async (stepId: string) => {
    const apiKey = getApiKey();
    if (!apiKey) {
      alert('請先設定 Gemini API 金鑰');
      return;
    }

    const step = prepSteps.find(s => s.id === stepId);
    if (!step) return;

    setTransformations(prev => ({
      ...prev,
      [stepId]: { ...prev[stepId], isTransforming: true }
    }));

    try {
      let transformedData = null;
      
      switch (step.type) {
        case 'objective':
          transformedData = await transformLearningObjectiveForStudent(step.data);
          break;
        case 'breakdown':
          transformedData = await transformContentBreakdownForStudent(step.data);
          break;
        case 'confusing':
          transformedData = await transformConfusingPointForStudent(step.data);
          break;
      }
      
      setTransformations(prev => ({
        ...prev,
        [stepId]: {
          ...prev[stepId],
          transformed: transformedData,
          isTransformed: true,
          isTransforming: false
        }
      }));
      
    } catch (error) {
      console.error('轉換失敗:', error);
      setTransformations(prev => ({
        ...prev,
        [stepId]: { ...prev[stepId], isTransforming: false }
      }));
      alert('轉換失敗，請重試');
    }
  };

  // 重置轉換
  const resetTransformation = (stepId: string) => {
    setTransformations(prev => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        transformed: null,
        isTransformed: false,
        quiz: null,
        hasQuiz: false
      }
    }));
  };

  // 顯示測驗設定對話框
  const showQuizSettingsDialog = (stepId: string) => {
    setQuizSettingsStepId(stepId);
    setShowQuizSettings(true);
  };

  // 生成步驟測驗
  const generateStepQuizForStep = async (stepId: string, customConfig?: any) => {
    const apiKey = getApiKey();
    if (!apiKey) {
      alert('請先設定 Gemini API 金鑰');
      return;
    }

    // stepId 格式是 "step_0", "step_1" 等，需要轉換為索引來找對應的步驟
    const stepIndex = parseInt(stepId.replace('step_', ''));
    const step = prepSteps[stepIndex];
    const transformation = transformations[stepId];
    
    if (!step || !transformation?.isTransformed || !transformation.transformed) {
      alert('請先轉換內容後再生成測驗');
      return;
    }

    setTransformations(prev => ({
      ...prev,
      [stepId]: { ...prev[stepId], isGeneratingQuiz: true }
    }));

    try {
      const configToUse = customConfig || quizConfig;
      
      const quizData = await generateStepQuiz(
        transformation.transformed,
        step.type,
        configToUse
      );
      
      setTransformations(prev => ({
        ...prev,
        [stepId]: {
          ...prev[stepId],
          quiz: quizData,
          hasQuiz: true,
          isGeneratingQuiz: false
        }
      }));
      
      // 關閉設定對話框
      setShowQuizSettings(false);
      
    } catch (error) {
      console.error('測驗生成失敗:', error);
      setTransformations(prev => ({
        ...prev,
        [stepId]: { ...prev[stepId], isGeneratingQuiz: false }
      }));
      alert('測驗生成失敗，請重試');
    }
  };

  // 預覽測驗
  const previewQuiz = (stepId: string) => {
    const transformation = transformations[stepId];
    if (transformation?.hasQuiz && transformation.quiz) {
      setPreviewQuizData(transformation.quiz);
      setPreviewStepId(stepId);
      setShowQuizPreview(true);
    }
  };

  // 重置步驟測驗
  const resetStepQuiz = (stepId: string) => {
    setTransformations(prev => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        quiz: null,
        hasQuiz: false
      }
    }));
  };

  // 批次轉換所有內容
  const batchTransformAll = async () => {
    if (!content) return;
    
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
      alert('請先設定 Gemini API Key');
      return;
    }

    setBatchTransformStatus('running');
    const totalSteps = prepSteps.length;
    setBatchProgress({current: 0, total: totalSteps});

    try {
      for (let i = 0; i < prepSteps.length; i++) {
        const step = prepSteps[i];
        const stepId = `step_${i}`;
        
        setBatchProgress({current: i + 1, total: totalSteps, currentStep: step.title});
        
        // 如果已經轉換過，跳過
        if (transformations[stepId]?.isTransformed) {
          continue;
        }

        // 設置正在轉換狀態
        setTransformations(prev => ({
          ...prev,
          [stepId]: {
            ...prev[stepId],
            isTransforming: true
          }
        }));

        try {
          let transformedData;
          
          switch (step.type) {
            case 'objective':
              transformedData = await transformLearningObjectiveForStudent(step.data);
              break;
            case 'breakdown':
              transformedData = await transformContentBreakdownForStudent(step.data);
              break;
            case 'confusing':
              transformedData = await transformConfusingPointForStudent(step.data);
              break;
          }
          
          setTransformations(prev => ({
            ...prev,
            [stepId]: {
              ...prev[stepId],
              transformed: transformedData,
              isTransformed: true,
              isTransforming: false
            }
          }));
          
        } catch (stepError) {
          console.error(`轉換步驟 ${step.title} 失敗:`, stepError);
          setTransformations(prev => ({
            ...prev,
            [stepId]: {
              ...prev[stepId],
              isTransforming: false
            }
          }));
          // 繼續處理下一個步驟，而不是停止整個批次
        }

        // 添加小延遲，避免API請求過於頻繁
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setBatchTransformStatus('completed');
    } catch (error) {
      console.error('批次轉換失敗:', error);
      setBatchTransformStatus('error');
    }
  };

  // 選擇性轉換管理函數
  const toggleStepSelection = (stepId: string) => {
    setSelectedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const selectAllSteps = () => {
    const allStepIds = prepSteps.map((_, index) => `step_${index}`);
    setSelectedSteps(new Set(allStepIds));
  };

  const deselectAllSteps = () => {
    setSelectedSteps(new Set());
  };

  // 批次轉換選中的內容
  const batchTransformSelected = async () => {
    if (!content || selectedSteps.size === 0) {
      alert('請先選擇要轉換的步驟');
      return;
    }
    
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
      alert('請先設定 Gemini API Key');
      return;
    }

    setBatchTransformStatus('running');
    const totalSteps = selectedSteps.size;
    setBatchProgress({current: 0, total: totalSteps});

    try {
      let currentStepNumber = 0;
      
      for (let i = 0; i < prepSteps.length; i++) {
        const step = prepSteps[i];
        const stepId = `step_${i}`;
        
        // 跳過未選中的步驟
        if (!selectedSteps.has(stepId)) {
          continue;
        }

        currentStepNumber++;
        setBatchProgress({current: currentStepNumber, total: totalSteps, currentStep: step.title});
        
        // 如果已經轉換過，跳過
        if (transformations[stepId]?.isTransformed) {
          continue;
        }

        // 設置正在轉換狀態
        setTransformations(prev => ({
          ...prev,
          [stepId]: {
            ...prev[stepId],
            isTransforming: true
          }
        }));

        try {
          let transformedData;
          
          switch (step.type) {
            case 'objective':
              transformedData = await transformLearningObjectiveForStudent(step.data);
              break;
            case 'breakdown':
              transformedData = await transformContentBreakdownForStudent(step.data);
              break;
            case 'confusing':
              transformedData = await transformConfusingPointForStudent(step.data);
              break;
          }
          
          setTransformations(prev => ({
            ...prev,
            [stepId]: {
              ...prev[stepId],
              transformed: transformedData,
              isTransformed: true,
              isTransforming: false
            }
          }));
          
        } catch (stepError) {
          console.error(`轉換步驟 ${step.title} 失敗:`, stepError);
          setTransformations(prev => ({
            ...prev,
            [stepId]: {
              ...prev[stepId],
              isTransforming: false
            }
          }));
        }

        // 添加小延遲，避免API請求過於頻繁
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setBatchTransformStatus('completed');
    } catch (error) {
      console.error('批次轉換失敗:', error);
      setBatchTransformStatus('error');
    }
  };

  // 獲取有效的 content ID 
  const getEffectiveContentId = (): string | null => {
    return contentId || binId;
  };

  // 版本管理函數
  const loadExistingVersions = async (lessonPlanId: string) => {
    try {
      await interactiveContentStorage.init();
      const versions = await interactiveContentStorage.getVersions(lessonPlanId);
      setAvailableVersions(versions);
    } catch (error) {
      console.error('載入現有版本失敗:', error);
    }
  };

  const saveCurrentAsVersion = async () => {
    console.log('=== 開始保存版本 ===');
    console.log('content:', !!content);
    console.log('contentId:', contentId);
    console.log('transformations:', transformations);
    
    if (!content) {
      console.log('❌ 缺少 content');
      alert('缺少教案內容，無法保存版本');
      return;
    }
    
    // 獲取有效的 content ID
    const actualContentId = getEffectiveContentId();
    if (!actualContentId) {
      console.log('❌ 無法取得有效的 contentId');
      alert('無法識別當前教案，請重新進入頁面');
      return;
    }
    console.log('使用的 contentId:', actualContentId);
    
    // 收集目前已轉換的數據和測驗資料
    const transformedData: { [stepId: string]: any } = {};
    const quizData: { [stepId: string]: any } = {};
    
    Object.entries(transformations).forEach(([stepId, transformation]) => {
      console.log(`檢查步驟 ${stepId}:`, {
        isTransformed: transformation.isTransformed,
        hasTransformed: !!transformation.transformed,
        hasQuiz: transformation.hasQuiz,
        hasQuizData: !!transformation.quiz
      });
      
      if (transformation.isTransformed && transformation.transformed) {
        transformedData[stepId] = transformation.transformed;
      }
      if (transformation.hasQuiz && transformation.quiz) {
        quizData[stepId] = transformation.quiz;
      }
    });

    console.log('收集到的資料:', {
      transformedDataCount: Object.keys(transformedData).length,
      quizDataCount: Object.keys(quizData).length,
      selectedStepsCount: selectedSteps.size
    });

    if (Object.keys(transformedData).length === 0) {
      console.log('❌ 沒有已轉換的內容');
      alert('請先轉換一些內容再保存版本');
      return;
    }

    try {
      console.log('初始化 interactiveContentStorage...');
      await interactiveContentStorage.init();
      console.log('✅ 初始化成功');
      
      const versionName = saveVersionName || `版本 ${new Date().toLocaleString('zh-TW')}`;
      const versionData = {
        transformedData,
        quizData
      };
      
      console.log('準備保存版本:', {
        actualContentId,
        topic: content.topic || '無標題教案',
        versionName,
        versionData,
        selectedSteps: Array.from(selectedSteps)
      });
      
      const versionId = await interactiveContentStorage.saveVersion(
        actualContentId,
        content.topic || '無標題教案',
        versionData,
        Array.from(selectedSteps),
        versionName,
        `包含 ${Object.keys(transformedData).length} 個已轉換步驟，${Object.keys(quizData).length} 個測驗`
      );
      
      console.log('✅ 版本保存成功，ID:', versionId);
      
      setSaveVersionName('');
      await loadExistingVersions(actualContentId);
      alert('版本保存成功！');
      
    } catch (error) {
      console.error('❌ 保存版本失敗:', error);
      console.error('錯誤堆棧:', error.stack);
      alert(`保存版本失敗：${error.message || error}`);
    }
    
    console.log('=== 保存版本結束 ===');
  };

  const loadVersion = async (versionId: string) => {
    const effectiveContentId = getEffectiveContentId();
    if (!effectiveContentId) return;
    
    try {
      await interactiveContentStorage.init();
      const version = await interactiveContentStorage.getVersion(effectiveContentId, versionId);
      
      if (version) {
        // 重置當前狀態
        setTransformations({});
        
        // 重新初始化所有步驟的轉換狀態
        const newTransformations: TransformationState = {};
        
        // 先為所有步驟設置默認狀態
        prepSteps.forEach((step, index) => {
          const stepId = `step_${index}`;
          newTransformations[stepId] = {
            original: step.data,
            transformed: null,
            isTransformed: false,
            isTransforming: false,
            quiz: null,
            hasQuiz: false,
            isGeneratingQuiz: false
          };
        });
        
        // 處理版本資料格式 (支援新舊格式)
        const versionTransformedData = version.transformedData?.transformedData || version.transformedData;
        const versionQuizData = version.transformedData?.quizData || {};
        
        // 然後加載版本中的轉換數據
        Object.entries(versionTransformedData || {}).forEach(([stepId, transformedData]) => {
          if (newTransformations[stepId]) {
            newTransformations[stepId] = {
              ...newTransformations[stepId],
              transformed: transformedData,
              isTransformed: true
            };
          }
        });
        
        // 加載版本中的測驗資料
        Object.entries(versionQuizData || {}).forEach(([stepId, quizData]) => {
          if (newTransformations[stepId]) {
            newTransformations[stepId] = {
              ...newTransformations[stepId],
              quiz: quizData,
              hasQuiz: true
            };
          }
        });
        
        setTransformations(newTransformations);
        setSelectedSteps(new Set(version.selectedSteps));
        setCurrentVersionId(versionId);
        setShowVersionSelector(false);
        
        await interactiveContentStorage.updateLastAccessed(effectiveContentId);
      }
    } catch (error) {
      console.error('載入版本失敗:', error);
      alert('載入版本失敗，請重試');
    }
  };

  const deleteVersion = async (versionId: string) => {
    const effectiveContentId = getEffectiveContentId();
    if (!effectiveContentId) return;
    
    const version = availableVersions.find(v => v.id === versionId);
    if (!version) return;

    if (!confirm(`確定要刪除版本「${version.name}」嗎？此操作無法復原。`)) {
      return;
    }

    try {
      await interactiveContentStorage.init();
      await interactiveContentStorage.deleteVersion(effectiveContentId, versionId);
      await loadExistingVersions(effectiveContentId);
      
      if (currentVersionId === versionId) {
        setCurrentVersionId(null);
      }
    } catch (error) {
      console.error('刪除版本失敗:', error);
      alert('刪除版本失敗，請重試');
    }
  };

  // 檢測文字是否包含 Markdown
  const containsMarkdown = (text: string): boolean => {
    if (!text) return false;
    
    const markdownPatterns = [
      /#+\s/, /\*\*.*\*\*/, /\*.*\*/, /`.*`/,
      /^\s*[-*+]\s/m, /^\s*\d+\.\s/m,
      /\[.*\]\(.*\)/, /^\s*>/m, /```[\s\S]*?```/, /\n\s*\n/,
    ];
    
    return markdownPatterns.some(pattern => pattern.test(text));
  };

  // 智能文字渲染
  const renderText = (text: string, className?: string) => {
    if (containsMarkdown(text)) {
      return <MarkdownRenderer content={text} className={className} />;
    }
    return <span className={className}>{text}</span>;
  };

  // 發布到 JSONBIN
  const publishInteractiveContent = async () => {
    if (!content) return;
    
    setPublishStatus('publishing');
    
    try {
      // 只收集已轉換的內容和測驗
      const transformedStepsData: { [stepId: string]: any } = {};
      const stepQuizData: { [stepId: string]: any } = {};
      const transformedOriginalContent: any = {};

      Object.entries(transformations).forEach(([stepId, transformation]) => {
        if (transformation.isTransformed && transformation.transformed) {
          transformedStepsData[stepId] = transformation.transformed;
          
          // 收集測驗資料
          if (transformation.hasQuiz && transformation.quiz) {
            stepQuizData[stepId] = transformation.quiz;
          }
          
          // 根據步驟類型，也保留對應的原始內容
          const stepIndex = parseInt(stepId.replace('step_', ''));
          const step = prepSteps[stepIndex];
          
          if (step) {
            switch (step.type) {
              case 'objective':
                if (!transformedOriginalContent.learningObjectives) {
                  transformedOriginalContent.learningObjectives = [];
                }
                transformedOriginalContent.learningObjectives.push(step.data);
                break;
              case 'breakdown':
                if (!transformedOriginalContent.contentBreakdown) {
                  transformedOriginalContent.contentBreakdown = [];
                }
                transformedOriginalContent.contentBreakdown.push(step.data);
                break;
              case 'confusing':
                if (!transformedOriginalContent.confusingPoints) {
                  transformedOriginalContent.confusingPoints = [];
                }
                transformedOriginalContent.confusingPoints.push(step.data);
                break;
            }
          }
        }
      });

      if (Object.keys(transformedStepsData).length === 0) {
        alert('請先轉換一些內容再發布');
        setPublishStatus('idle');
        return;
      }

      // 構建只包含已轉換內容的資料
      const transformedContent: ExtendedLearningContent = {
        ...transformedOriginalContent, // 只包含已轉換步驟對應的原始內容
        topic: content.topic,
        // 標記為已轉換的互動內容
        isInteractive: true,
        transformedData: transformedStepsData,
        stepQuizData: stepQuizData,
        // 記錄哪些步驟被包含
        includedSteps: Object.keys(transformedStepsData)
      };

      // 保存到 JSONBIN
      const binId = await saveLearningContent(transformedContent);
      const studentUrl = `${window.location.origin}${import.meta.env.BASE_URL}student-interactive?binId=${binId}`;
      
      setPublishedUrl(studentUrl);
      setPublishStatus('published');
      
    } catch (error) {
      console.error('發布失敗:', error);
      setPublishStatus('error');
    }
  };

  // 導航函數
  const goToStep = (stepIndex: number) => {
    setCurrentStepIndex(stepIndex);
  };

  const nextStep = () => {
    if (currentStepIndex < prepSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center min-h-[50vh]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-md">
            <h3 className="font-bold text-lg mb-2">載入錯誤</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!content || prepSteps.length === 0) {
    return null;
  }

  const currentStep = prepSteps[currentStepIndex];
  const currentStepId = `step_${currentStepIndex}`;
  const currentTransformation = transformations[currentStepId] || {
    original: currentStep?.data,
    transformed: null,
    isTransformed: false,
    isTransforming: false
  };
  
  // 計算完成進度
  const transformedCount = Object.values(transformations).filter(t => t.isTransformed).length;
  const totalSteps = prepSteps.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100">
      {/* 頂部導航 */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-slate-800">互動教材準備</h1>
              <h2 className="text-lg font-semibold text-indigo-600">{content.topic}</h2>
              <p className="text-sm text-slate-600">
                第 {currentStepIndex + 1} 步，共 {totalSteps} 步 • 已轉換：{transformedCount}/{totalSteps}
              </p>
            </div>
            
            {/* 批次轉換和發布狀態 */}
            <div className="flex items-center gap-4">
              {/* 批次轉換進度顯示 */}
              {batchTransformStatus === 'running' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-blue-600 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-blue-800 font-medium">批次轉換進行中...</span>
                  </div>
                  <div className="text-xs text-blue-700">
                    {batchProgress.currentStep && `正在轉換：${batchProgress.currentStep}`}
                  </div>
                  <div className="mt-1 bg-blue-200 rounded-full h-1">
                    <div 
                      className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                      style={{width: `${(batchProgress.current / batchProgress.total) * 100}%`}}
                    />
                  </div>
                </div>
              )}
              
              {batchTransformStatus === 'completed' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-800 font-medium text-sm">批次轉換完成！</span>
                  </div>
                </div>
              )}
              
              {/* 批次轉換按鈕 */}
              <div className="flex items-center gap-2">
                <button
                  onClick={batchTransformSelected}
                  disabled={batchTransformStatus === 'running' || selectedSteps.size === 0}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  {batchTransformStatus === 'running' ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      轉換中...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      轉換選中項目 ({selectedSteps.size})
                    </>
                  )}
                </button>
                <button
                  onClick={batchTransformAll}
                  disabled={batchTransformStatus === 'running' || transformedCount === totalSteps}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2 text-sm"
                >
                  {transformedCount === totalSteps ? '全部已轉換' : '全部轉換'}
                </button>
              </div>
              
              {publishStatus === 'published' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-800 font-medium">已發布成功！</span>
                  </div>
                  <div className="text-xs text-green-700">
                    <a href={publishedUrl} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
                      查看學生學習頁面
                    </a>
                  </div>
                </div>
              )}
              
              <button
                onClick={publishInteractiveContent}
                disabled={publishStatus === 'publishing' || transformedCount === 0}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {publishStatus === 'publishing' ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    發布中...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    發布互動教材
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 進度條 */}
          <div className="space-y-3">
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-sky-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
              />
            </div>
            
            {/* 選擇控制 */}
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={selectAllSteps}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  全選
                </button>
                <span className="text-slate-300">|</span>
                <button
                  onClick={deselectAllSteps}
                  className="text-xs text-slate-600 hover:text-slate-800 font-medium"
                >
                  全不選
                </button>
              </div>
              <div className="text-xs text-slate-500">
                已選擇 {selectedSteps.size} / {prepSteps.length} 個步驟
              </div>
              
              {/* 版本管理控制 */}
              <div className="flex items-center gap-2 text-xs">
                {availableVersions.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">版本:</span>
                    <button
                      onClick={() => setShowVersionSelector(!showVersionSelector)}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      {currentVersionId ? 
                        availableVersions.find(v => v.id === currentVersionId)?.name || '選擇版本' 
                        : `${availableVersions.length} 個可用`}
                    </button>
                  </div>
                )}
                <input
                  type="text"
                  placeholder="版本名稱"
                  value={saveVersionName}
                  onChange={(e) => setSaveVersionName(e.target.value)}
                  className="px-2 py-1 text-xs border border-slate-300 rounded w-20"
                />
                <button
                  onClick={() => {
                    console.log('🔴 保存版本按鈕被點擊了！');
                    saveCurrentAsVersion();
                  }}
                  className="text-green-600 hover:text-green-800 font-medium"
                >
                  保存版本
                </button>
              </div>
            </div>
            
            {/* 步驟導航 */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {prepSteps.map((step, index) => {
                const stepId = `step_${index}`;
                return (
                  <div
                    key={step.id}
                    className={`
                      flex-shrink-0 p-2 rounded-lg border transition-all duration-200 bg-white
                      ${index === currentStepIndex 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : transformations[stepId]?.isTransformed
                        ? 'border-green-200 bg-green-50'
                        : 'border-slate-200'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedSteps.has(stepId)}
                        onChange={() => toggleStepSelection(stepId)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <button
                        onClick={() => goToStep(index)}
                        className="flex items-center gap-1 text-xs font-medium hover:text-indigo-600 transition-colors"
                      >
                        <span>{step.icon}</span>
                        <span>{step.title}</span>
                        {transformations[stepId]?.isTransformed && (
                          <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      
                      {/* 個別步驟控制按鈕 */}
                      {transformations[stepId]?.isTransformed ? (
                        <div className="flex items-center gap-1 ml-2">
                          {/* 轉換控制 */}
                          <button
                            onClick={() => transformStep(stepId)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium px-1 py-0.5 rounded hover:bg-blue-50"
                            title="重新轉換"
                          >
                            🔄
                          </button>
                          <button
                            onClick={() => resetTransformation(stepId)}
                            className="text-xs text-red-600 hover:text-red-800 font-medium px-1 py-0.5 rounded hover:bg-red-50"
                            title="重置"
                          >
                            🗑️
                          </button>
                          
                          {/* 測驗控制 */}
                          {transformations[stepId]?.hasQuiz ? (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-orange-600" title="已生成測驗">🧠</span>
                              <button
                                onClick={() => previewQuiz(stepId)}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium px-1 py-0.5 rounded hover:bg-blue-50"
                                title="預覽測驗"
                              >
                                👁️
                              </button>
                              <button
                                onClick={() => showQuizSettingsDialog(stepId)}
                                disabled={transformations[stepId]?.isGeneratingQuiz}
                                className="text-xs text-orange-600 hover:text-orange-800 font-medium px-1 py-0.5 rounded hover:bg-orange-50"
                                title="重新生成測驗"
                              >
                                {transformations[stepId]?.isGeneratingQuiz ? (
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></div>
                                    <span>生成中</span>
                                  </div>
                                ) : '🔄'}
                              </button>
                              <button
                                onClick={() => resetStepQuiz(stepId)}
                                className="text-xs text-red-600 hover:text-red-800 font-medium px-1 py-0.5 rounded hover:bg-red-50"
                                title="刪除測驗"
                              >
                                🗑️
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => showQuizSettingsDialog(stepId)}
                              disabled={transformations[stepId]?.isGeneratingQuiz}
                              className="text-xs text-orange-600 hover:text-orange-800 font-medium px-1 py-0.5 rounded hover:bg-orange-50 disabled:opacity-50"
                              title="生成測驗"
                            >
                              {transformations[stepId]?.isGeneratingQuiz ? (
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></div>
                                  <span className="text-xs">生成中</span>
                                </div>
                              ) : '🧠'}
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => transformStep(stepId)}
                          disabled={transformations[stepId]?.isTransforming}
                          className="text-xs text-green-600 hover:text-green-800 font-medium px-2 py-0.5 rounded hover:bg-green-50 disabled:opacity-50 ml-2"
                        >
                          {transformations[stepId]?.isTransforming ? '⏳' : '▶️'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* 版本選擇器 */}
            {showVersionSelector && availableVersions.length > 0 && (
              <div className="mt-4 p-4 bg-slate-50 rounded-lg border">
                <h3 className="text-sm font-medium text-slate-800 mb-3">選擇版本載入</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availableVersions.map((version) => (
                    <div key={version.id} className="flex items-center justify-between p-2 bg-white rounded border hover:bg-slate-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{version.name}</span>
                          {currentVersionId === version.id && (
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">當前</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {version.description} • {new Date(version.createdAt).toLocaleString('zh-TW')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => loadVersion(version.id)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          載入
                        </button>
                        <button
                          onClick={() => deleteVersion(version.id)}
                          className="text-xs text-red-600 hover:text-red-800 font-medium"
                        >
                          刪除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowVersionSelector(false)}
                  className="mt-3 text-xs text-slate-600 hover:text-slate-800"
                >
                  關閉
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 當前步驟 */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">{currentStep.icon}</div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">{currentStep.title}</h2>
          <p className="text-lg text-slate-600">
            {currentStep.type === 'objective' && '將學習目標轉換為學生友好的語言'}
            {currentStep.type === 'breakdown' && '將內容分解轉換為易懂的學習材料'}  
            {currentStep.type === 'confusing' && '將易混淆點轉換為支持性指導'}
          </p>
        </div>

        {/* 轉換控制區 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">
                {currentTransformation.isTransformed ? '✅' : '🔄'}
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">
                  {currentTransformation.isTransformed ? '已完成轉換' : '準備轉換內容'}
                </h3>
                <p className="text-sm text-slate-600">
                  {currentTransformation.isTransformed 
                    ? '內容已轉換為學生友好格式，可以進行預覽或重新轉換'
                    : '點擊轉換按鈕將教師導向內容轉換為學生友好格式'
                  }
                </p>
              </div>
            </div>
            
            <div className="text-sm text-slate-500">
              使用上方導航欄中的控制按鈕進行轉換操作
            </div>
          </div>
        </div>

        {/* 內容預覽 */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* 原始內容 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span>📄</span>
              原始內容（教師導向）
            </h3>
            <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 max-h-96 overflow-y-auto">
              {currentStep.type === 'objective' && (
                <div className="space-y-3">
                  <div><strong>目標：</strong> {renderText(currentStep.data.objective)}</div>
                  {currentStep.data.description && (
                    <div><strong>描述：</strong> {renderText(currentStep.data.description)}</div>
                  )}
                  {currentStep.data.teachingExample && (
                    <div><strong>教學範例：</strong> {renderText(currentStep.data.teachingExample)}</div>
                  )}
                </div>
              )}
              
              {currentStep.type === 'breakdown' && (
                <div className="space-y-3">
                  <div><strong>主題：</strong> {renderText(currentStep.data.topic)}</div>
                  {currentStep.data.details && (
                    <div><strong>詳細說明：</strong> {renderText(currentStep.data.details)}</div>
                  )}
                  {currentStep.data.teachingExample && (
                    <div><strong>教學範例：</strong> {renderText(currentStep.data.teachingExample)}</div>
                  )}
                </div>
              )}
              
              {currentStep.type === 'confusing' && (
                <div className="space-y-3">
                  <div><strong>易混淆點：</strong> {renderText(currentStep.data.point)}</div>
                  {currentStep.data.clarification && (
                    <div><strong>澄清說明：</strong> {renderText(currentStep.data.clarification)}</div>
                  )}
                  {currentStep.data.teachingExample && (
                    <div><strong>教學範例：</strong> {renderText(currentStep.data.teachingExample)}</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 轉換後內容 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span>✨</span>
              轉換後內容（學生友好）
            </h3>
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 text-sm max-h-96 overflow-y-auto">
              {currentTransformation.isTransformed && currentTransformation.transformed ? (
                <div className="space-y-4">
                  {currentStep.type === 'objective' && (
                    <>
                      <div className="text-green-800">
                        <strong>學習目標：</strong>
                        <div className="mt-1">{renderText(currentTransformation.transformed.objective)}</div>
                      </div>
                      {currentTransformation.transformed.description && (
                        <div className="text-blue-800">
                          <strong>為什麼要學：</strong>
                          <div className="mt-1">{renderText(currentTransformation.transformed.description)}</div>
                        </div>
                      )}
                      {currentTransformation.transformed.personalRelevance && (
                        <div className="text-purple-800">
                          <strong>對你的意義：</strong>
                          <div className="mt-1">{renderText(currentTransformation.transformed.personalRelevance)}</div>
                        </div>
                      )}
                      {currentTransformation.transformed.encouragement && (
                        <div className="text-sky-800">
                          <strong>給你的鼓勵：</strong>
                          <div className="mt-1">{renderText(currentTransformation.transformed.encouragement)}</div>
                        </div>
                      )}
                    </>
                  )}
                  
                  {currentStep.type === 'breakdown' && (
                    <>
                      {currentTransformation.transformed.title && (
                        <div className="text-green-800">
                          <strong>學習主題：</strong>
                          <div className="mt-1">{renderText(currentTransformation.transformed.title)}</div>
                        </div>
                      )}
                      {currentTransformation.transformed.introduction && (
                        <div className="text-blue-800">
                          <strong>開始學習：</strong>
                          <div className="mt-1">{renderText(currentTransformation.transformed.introduction)}</div>
                        </div>
                      )}
                      {currentTransformation.transformed.keyPoints && (
                        <div className="text-indigo-800">
                          <strong>重點概念：</strong>
                          <div className="mt-1 space-y-1">
                            {currentTransformation.transformed.keyPoints.map((point, idx) => (
                              <div key={idx}>• {renderText(point)}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  {currentStep.type === 'confusing' && (
                    <>
                      {currentTransformation.transformed.title && (
                        <div className="text-amber-800">
                          <strong>容易困惑的地方：</strong>
                          <div className="mt-1">{renderText(currentTransformation.transformed.title)}</div>
                        </div>
                      )}
                      {currentTransformation.transformed.normalizeConfusion && (
                        <div className="text-green-800">
                          <strong>別擔心：</strong>
                          <div className="mt-1">{renderText(currentTransformation.transformed.normalizeConfusion)}</div>
                        </div>
                      )}
                      {currentTransformation.transformed.clearExplanation && (
                        <div className="text-blue-800">
                          <strong>正確理解：</strong>
                          <div className="mt-1">{renderText(currentTransformation.transformed.clearExplanation)}</div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="text-slate-500 text-center py-8">
                  <div className="text-4xl mb-4">🔄</div>
                  <p>使用上方導航欄中的 ▶️ 按鈕來生成學生友好的內容</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 底部導航 */}
        <div className="flex items-center justify-between pt-8 border-t border-slate-200">
          <button
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-2 px-6 py-3 bg-slate-500 text-white font-medium rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            上一步
          </button>
          
          <div className="text-center">
            <p className="text-sm text-slate-600">
              {currentStepIndex + 1} / {totalSteps}
            </p>
          </div>

          <button
            onClick={nextStep}
            disabled={currentStepIndex === prepSteps.length - 1}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一步
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* 測驗設定對話框 */}
      {showQuizSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">測驗設定</h3>
                <button
                  onClick={() => setShowQuizSettings(false)}
                  className="p-1 hover:bg-slate-100 rounded-full"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  是非題數量
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={quizConfig.trueFalse}
                  onChange={(e) => setQuizConfig(prev => ({
                    ...prev,
                    trueFalse: parseInt(e.target.value) || 1
                  }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  選擇題數量
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={quizConfig.multipleChoice}
                  onChange={(e) => setQuizConfig(prev => ({
                    ...prev,
                    multipleChoice: parseInt(e.target.value) || 1
                  }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  記憶卡遊戲組數
                </label>
                <input
                  type="number"
                  min="1"
                  max="3"
                  value={quizConfig.memoryCardGame}
                  onChange={(e) => setQuizConfig(prev => ({
                    ...prev,
                    memoryCardGame: parseInt(e.target.value) || 1
                  }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div className="p-6 border-t bg-slate-50 rounded-b-2xl">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowQuizSettings(false)}
                  className="flex-1 px-4 py-2 bg-slate-500 text-white font-medium rounded-lg hover:bg-slate-600 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => generateStepQuizForStep(quizSettingsStepId, quizConfig)}
                  disabled={transformations[quizSettingsStepId]?.isGeneratingQuiz}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {transformations[quizSettingsStepId]?.isGeneratingQuiz ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      生成中...
                    </div>
                  ) : '生成測驗'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 測驗預覽對話框 */}
      {showQuizPreview && previewQuizData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-xl font-bold text-slate-800">📝 測驗預覽</h3>
              <button
                onClick={() => setShowQuizPreview(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* 驗證警告 */}
              {previewQuizData._validationWarnings && previewQuizData._validationWarnings.length > 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-yellow-800">
                        ⚠️ 發現記憶卡內容問題
                      </h4>
                      <div className="mt-2 text-sm text-yellow-700">
                        <ul className="list-disc list-inside space-y-1">
                          {previewQuizData._validationWarnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                          ))}
                        </ul>
                        <p className="mt-2 font-medium">
                          建議重新生成測驗以確保學生體驗良好！
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 是非題預覽 */}
              {previewQuizData.trueFalse && previewQuizData.trueFalse.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <span>✓</span> 是非判斷題 ({previewQuizData.trueFalse.length} 題)
                  </h4>
                  <div className="space-y-3">
                    {previewQuizData.trueFalse.map((question, index) => (
                      <div key={index} className="bg-slate-50 p-4 rounded-lg">
                        <div className="font-medium text-slate-800 mb-2">
                          {index + 1}. {question.statement}
                        </div>
                        <div className="text-sm text-slate-600">
                          <strong>答案：</strong> {question.isTrue ? '正確' : '錯誤'}
                        </div>
                        {question.explanation && (
                          <div className="text-sm text-slate-600 mt-1">
                            <strong>解釋：</strong> {question.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 選擇題預覽 */}
              {previewQuizData.multipleChoice && previewQuizData.multipleChoice.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <span>📝</span> 選擇題 ({previewQuizData.multipleChoice.length} 題)
                  </h4>
                  <div className="space-y-3">
                    {previewQuizData.multipleChoice.map((question, index) => (
                      <div key={index} className="bg-slate-50 p-4 rounded-lg">
                        <div className="font-medium text-slate-800 mb-2">
                          {index + 1}. {question.question}
                        </div>
                        <div className="ml-4 space-y-1">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className={`text-sm ${optIndex === question.correctAnswerIndex ? 'text-green-700 font-medium' : 'text-slate-600'}`}>
                              {String.fromCharCode(65 + optIndex)}. {option} 
                              {optIndex === question.correctAnswerIndex && ' ✓'}
                            </div>
                          ))}
                        </div>
                        {question.explanation && (
                          <div className="text-sm text-slate-600 mt-2">
                            <strong>解釋：</strong> {question.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 記憶卡遊戲預覽 */}
              {previewQuizData.memoryCardGame && previewQuizData.memoryCardGame.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <span>🧠</span> 記憶卡配對 ({previewQuizData.memoryCardGame.length} 組)
                  </h4>
                  <div className="space-y-3">
                    {previewQuizData.memoryCardGame.map((game, index) => (
                      <div key={index} className="bg-slate-50 p-4 rounded-lg">
                        <div className="font-medium text-slate-800 mb-3">
                          第 {index + 1} 組：{game.title || '配對遊戲'}
                        </div>
                        <div className="grid md:grid-cols-2 gap-2">
                          {game.pairs.map((pair, pairIndex) => (
                            <div key={pairIndex} className="flex items-center gap-2 text-sm">
                              <div className="bg-blue-100 px-2 py-1 rounded flex-1">
                                {pair.left}
                              </div>
                              <div className="text-slate-400">⟷</div>
                              <div className="bg-green-100 px-2 py-1 rounded flex-1">
                                {pair.right}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-slate-50 p-6 border-t rounded-b-2xl">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowQuizPreview(false)}
                  className="flex-1 px-4 py-2 bg-slate-500 text-white font-medium rounded-lg hover:bg-slate-600 transition-colors"
                >
                  關閉預覽
                </button>
                <button
                  onClick={() => {
                    setShowQuizPreview(false);
                    showQuizSettingsDialog(previewStepId);
                  }}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
                >
                  重新生成
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherInteractivePrepPage;