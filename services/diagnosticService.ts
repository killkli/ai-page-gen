import { 
  QuestionResponse, 
  QuestionTypePerformance, 
  LearningWeakness, 
  LearningStrength, 
  PersonalizedRecommendation, 
  StudentLearningFeedback, 
  TeacherDiagnosticReport, 
  DiagnosticSession, 
  LearningDiagnosticResult,
  QuizContentKey,
  DiagnosticReportConfig 
} from '../types';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// 內部函數：調用 Gemini AI
const callGeminiForDiagnosticForDiagnostic = async (prompt: string, apiKey: string): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-2.5-flash';
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });
    if (!response.text) throw new Error("AI 回傳內容為空，請重試或檢查 API 金鑰。");
    let jsonStr = response.text.trim();
    // 先移除 code block fence
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) jsonStr = match[2].trim();
    // 嘗試抓出第一個合法 JSON 區塊（{} 或 []）
    if (!jsonStr.startsWith("{") && !jsonStr.startsWith("[") && (jsonStr.includes("{") || jsonStr.includes("["))) {
      const objStart = jsonStr.indexOf("{");
      const arrStart = jsonStr.indexOf("[");
      let jsonStart = -1;
      let jsonEnd = -1;
      if (objStart !== -1 && (arrStart === -1 || objStart < arrStart)) {
        // 以 { 開頭
        jsonStart = objStart;
        jsonEnd = jsonStr.lastIndexOf("}");
      } else if (arrStart !== -1) {
        // 以 [ 開頭
        jsonStart = arrStart;
        jsonEnd = jsonStr.lastIndexOf("]");
      }
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        jsonStr = jsonStr.substring(jsonStart, jsonEnd + 1);
      }
    }
    try {
      return JSON.parse(jsonStr);
    } catch (err) {
      // log 原始內容方便 debug
      console.error("AI 回傳原始內容 (JSON parse 失敗):", response.text);
      throw new Error("AI 模型傳回的資料格式無法解析 (可能不是有效的 JSON)。請嘗試修改您的主題或重試。");
    }
  } catch (error) {
    let errorMessage = "無法產生診斷內容。";
    if (error instanceof Error) errorMessage += ` 詳細資料： ${error.message}`;
    throw new Error(errorMessage);
  }
};

// 分析測驗結果並生成統計數據
export const analyzeQuizResults = (responses: QuestionResponse[]): QuestionTypePerformance[] => {
  const performanceMap = new Map<QuizContentKey, QuestionTypePerformance>();

  // 初始化各題型統計
  responses.forEach(response => {
    if (!performanceMap.has(response.questionType)) {
      performanceMap.set(response.questionType, {
        questionType: response.questionType,
        totalQuestions: 0,
        correctCount: 0,
        accuracy: 0,
        averageTime: 0,
        commonErrors: [],
        difficultyBreakdown: {
          easy: { total: 0, correct: 0, accuracy: 0 },
          normal: { total: 0, correct: 0, accuracy: 0 },
          hard: { total: 0, correct: 0, accuracy: 0 }
        }
      });
    }
  });

  // 計算統計數據
  responses.forEach(response => {
    const performance = performanceMap.get(response.questionType)!;
    
    performance.totalQuestions++;
    if (response.isCorrect) {
      performance.correctCount++;
    }
    
    // 更新難度分解統計
    const difficultyStats = performance.difficultyBreakdown[response.difficulty];
    difficultyStats.total++;
    if (response.isCorrect) {
      difficultyStats.correct++;
    }
    difficultyStats.accuracy = difficultyStats.total > 0 
      ? Math.round((difficultyStats.correct / difficultyStats.total) * 100) 
      : 0;
  });

  // 計算整體正確率和平均時間
  performanceMap.forEach(performance => {
    performance.accuracy = performance.totalQuestions > 0 
      ? Math.round((performance.correctCount / performance.totalQuestions) * 100) 
      : 0;
    
    const responsesForType = responses.filter(r => r.questionType === performance.questionType);
    const timesWithData = responsesForType.filter(r => r.responseTime).map(r => r.responseTime!);
    performance.averageTime = timesWithData.length > 0 
      ? Math.round(timesWithData.reduce((sum, time) => sum + time, 0) / timesWithData.length) 
      : undefined;
  });

  return Array.from(performanceMap.values());
};

// 計算整體得分 - 使用簡單的答對比例
export const calculateOverallScore = (responses: QuestionResponse[]): number => {
  if (responses.length === 0) return 0;
  
  const correctAnswers = responses.filter(r => r.isCorrect).length;
  return Math.round((correctAnswers / responses.length) * 100);
};

// 確定學習水準
export const determineLearningLevel = (overallScore: number): 'beginner' | 'intermediate' | 'advanced' => {
  if (overallScore >= 80) return 'advanced';
  if (overallScore >= 60) return 'intermediate';
  return 'beginner';
};

// 使用AI生成學習診斷分析
export const generateLearningAnalysisWithAI = async (
  topic: string,
  responses: QuestionResponse[],
  performances: QuestionTypePerformance[],
  apiKey: string
): Promise<{ strengths: LearningStrength[], weaknesses: LearningWeakness[], learningStyle?: string, cognitivePattern?: string }> => {
  
  // 整理錯誤的具體題目和答案
  const incorrectResponses = responses.filter(r => !r.isCorrect);
  const correctResponses = responses.filter(r => r.isCorrect);
  
  const errorAnalysis = incorrectResponses.map(r => {
    return `
    題型: ${r.questionType}
    難度: ${r.difficulty}
    學生答案: ${JSON.stringify(r.userAnswer)}
    正確答案: ${JSON.stringify(r.correctAnswer)}
    嘗試次數: ${r.attempts || 1}`;
  }).join('\n');
  
  const correctAnalysis = correctResponses.map(r => {
    return `
    題型: ${r.questionType}
    難度: ${r.difficulty}
    學生答案: ${JSON.stringify(r.userAnswer)}`;
  }).join('\n');

  const prompt = `
    針對主題「${topic}」的測驗表現進行學習診斷分析。
    
    總體表現：
    - 答對題数：${correctResponses.length}
    - 答錯題数：${incorrectResponses.length}
    - 正確率：${Math.round((correctResponses.length / responses.length) * 100)}%
    
    答錯題目詳細分析：${errorAnalysis}
    
    答對題目詳細分析：${correctAnalysis}
    
    請提供以下 JSON 結構的分析（不要解釋，不要額外文字）：
    {
      "strengths": [
        {
          "area": "學生的具體強項領域",
          "description": "根據答對的題目類型和內容，詳細描述學生的優勢",
          "level": "good|excellent|outstanding",
          "examples": ["從答對題目中提取的具體表現例子"],
          "leverageOpportunities": ["如何利用此強項來改善弱點的具體建議"]
        }
      ],
      "weaknesses": [
        {
          "area": "根據錯誤題目整理出的知識漏洞領域",
          "description": "分析錯誤原因：是概念不清、計算錯誤、還是理解偏差？",
          "severity": "low|medium|high",
          "affectedTopics": ["具體受影響的知識點或技能"],
          "recommendedActions": ["針對此類錯誤的具體改進方法和練習建議"]
        }
      ],
      "learningStyle": "根據答題表現推測的學習風格（如：視覺型、邏輯型、記憶型等）",
      "cognitivePattern": "認知模式分析（如：敬重細節、善於整體把握等）"
    }
    
    請用繁體中文回答，並提供對學生和教師都有價值的教育洞察。特別要針對錯誤題目做出具體分析和改進建議。
  `;

  try {
    return await callGeminiForDiagnosticForDiagnostic(prompt, apiKey);
  } catch (error) {
    console.error('AI 學習分析生成失敗:', error);
    // 提供預設分析作為備案
    return {
      strengths: [],
      weaknesses: [],
      learningStyle: '無法分析',
      cognitivePattern: '需要更多數據'
    };
  }
};

// 使用AI生成個人化學習建議
export const generatePersonalizedRecommendations = async (
  topic: string,
  overallScore: number,
  learningLevel: string,
  strengths: LearningStrength[],
  weaknesses: LearningWeakness[],
  apiKey: string
): Promise<PersonalizedRecommendation[]> => {
  const prompt = `
    Generate personalized learning recommendations for a student based on their performance analysis.
    
    Context:
    - Topic: "${topic}"
    - Overall Score: ${overallScore}%
    - Learning Level: ${learningLevel}
    - Key Strengths: ${strengths.map(s => s.area).join(', ')}
    - Areas for Improvement: ${weaknesses.map(w => w.area).join(', ')}
    
    Please provide 3-5 personalized recommendations in the following JSON structure (no explanation, no extra text):
    {
      "recommendations": [
        {
          "category": "immediate|short-term|long-term",
          "priority": "high|medium|low",
          "title": "建議標題",
          "description": "詳細說明為什麼需要這個建議",
          "actionSteps": ["具體行動步驟1", "具體行動步驟2"],
          "expectedOutcome": "預期能達到的成果",
          "estimatedTime": "預估需要投入的時間",
          "resources": ["推薦的學習資源"]
        }
      ]
    }
    
    Focus on actionable, specific recommendations that consider the student's current level and identified strengths/weaknesses.
    Respond in Traditional Chinese (繁體中文).
  `;

  try {
    const result = await callGeminiForDiagnosticForDiagnostic(prompt, apiKey);
    return result.recommendations || [];
  } catch (error) {
    console.error('AI 個人化建議生成失敗:', error);
    return [];
  }
};

// 生成學生版回饋
export const generateStudentFeedback = async (
  topic: string,
  overallScore: number,
  overallLevel: string,
  performances: QuestionTypePerformance[],
  strengths: LearningStrength[],
  weaknesses: LearningWeakness[],
  apiKey: string,
  studentId?: string,
  responses?: QuestionResponse[]
): Promise<StudentLearningFeedback> => {
  
  // 整理錯誤題目的具體資訊
  const incorrectResponses = responses?.filter(r => !r.isCorrect) || [];
  const errorDetails = incorrectResponses.map(r => `
  - ${r.questionType} (難度: ${r.difficulty}): 你的答案「${JSON.stringify(r.userAnswer)}」，正確答案是「${JSON.stringify(r.correctAnswer)}」`).join('');
  
  const prompt = `
    為學生提供關於主題「${topic}」的學習回饋和指導。
    
    表現概要：
    - 總分：${overallScore}%
    - 學習水平：${overallLevel}
    - 主要強項：${strengths.map(s => s.area).join('、')}
    - 需要改進的領域：${weaknesses.map(w => w.area).join('、')}
    
    錯誤題目詳情：${errorDetails}
    
    請提供學生友善的回饋，使用以下 JSON 結構（不要解釋，不要額外文字）：
    {
      "encouragementMessage": "根據實際分數給出的鼓勵訊息，要具體且正面",
      "keyStrengths": ["從答對的題目中發現的具體強項", "另一個強項", "第三個強項"],
      "improvementAreas": ["根據錯誤題目整理的具體需加強領域", "另一個需加強領域"],
      "nextSteps": ["針對錯誤題目的具體改進行動", "強化練習建議", "補強知識漏洞的方法"],
      "studyTips": ["針對錯誤類型的實用學習技巧", "加強記憶的方法", "提高理解的策略"],
      "motivationalQuote": "激勵學生繼續努力的結尾話"
    }
    
    使用鼓勵、正向的語言，適合學生閱讀。重點關注成長心態和可實行的建議。
    請用繁體中文回答，特別要針對具體錯誤提供有針對性的改進建議。
  `;

  try {
    const result = await callGeminiForDiagnosticForDiagnostic(prompt, apiKey);
    return {
      studentId,
      overallScore,
      overallLevel: overallLevel as 'beginner' | 'intermediate' | 'advanced',
      encouragementMessage: result.encouragementMessage || '你的學習表現很棒！',
      keyStrengths: result.keyStrengths || [],
      improvementAreas: result.improvementAreas || [],
      nextSteps: result.nextSteps || [],
      studyTips: result.studyTips || [],
      motivationalQuote: result.motivationalQuote || '持續努力，你會更進步！'
    };
  } catch (error) {
    console.error('AI 學生回饋生成失敗:', error);
    // 提供預設回饋
    return {
      studentId,
      overallScore,
      overallLevel: overallLevel as 'beginner' | 'intermediate' | 'advanced',
      encouragementMessage: '你的學習表現很棒！繼續保持這個學習態度。',
      keyStrengths: ['積極參與測驗', '展現學習動機'],
      improvementAreas: ['需要更多練習'],
      nextSteps: ['重新檢視錯誤題目', '加強基礎概念', '定期練習'],
      studyTips: ['制定規律的學習時間', '多做類似練習題', '請教老師或同學'],
      motivationalQuote: '每一次練習都讓你更接近目標！'
    };
  }
};

// 生成教學建議
export const generateTeachingRecommendations = async (
  topic: string,
  overallScore: number,
  performances: QuestionTypePerformance[],
  strengths: LearningStrength[],
  weaknesses: LearningWeakness[],
  apiKey: string,
  responses?: QuestionResponse[]
): Promise<{
  immediateInterventions: string[];
  instructionalStrategies: string[];
  differentiation: string[];
  parentGuidance?: string[];
}> => {
  
  // 整理錯誤資訊供教師參考
  const incorrectResponses = responses?.filter(r => !r.isCorrect) || [];
  const errorPatterns = incorrectResponses.map(r => `
  - 題型: ${r.questionType}, 難度: ${r.difficulty}
    學生答案: ${JSON.stringify(r.userAnswer)}
    正確答案: ${JSON.stringify(r.correctAnswer)}
    嘗試次數: ${r.attempts || 1}`).join('');
  
  const prompt = `
    為主題「${topic}」提供教學建議，根據學生評量結果。
    
    表現概要：
    - 總體表現：${overallScore}%
    - 強項：${strengths.map(s => s.area).join('、')}
    - 需要支援的領域：${weaknesses.map(w => w.area).join('、')}
    - 各題型表現：${performances.map(p => `${p.questionType}: ${p.accuracy}%`).join('、')}
    
    具體錯誤模式分析：${errorPatterns}
    
    請提供教學建議，使用以下 JSON 結構（不要解釋，不要額外文字）：
    {
      "immediateInterventions": ["根據具體錯誤類型提供的立即介入措施", "針對知識漏洞的急需處理方法"],
      "instructionalStrategies": ["針對錯誤模式的教學策略", "加強理解的教學方法", "預防相似錯誤的策略"],
      "differentiation": ["根據錯誤類型設計的差異化教學", "適合不同學習風格的調整"],
      "parentGuidance": ["家長在家輔導的具體建議", "家庭練習的重點領域"]
    }
    
    重點在於實用、基於證據的教學策略，並針對識別出的強項和弱點提供具體建議。
    請用繁體中文回答，特別要針對學生的具體錯誤提供有針對性的教學建議。
  `;

  try {
    const result = await callGeminiForDiagnosticForDiagnostic(prompt, apiKey);
    return {
      immediateInterventions: result.immediateInterventions || [],
      instructionalStrategies: result.instructionalStrategies || [],
      differentiation: result.differentiation || [],
      parentGuidance: result.parentGuidance || []
    };
  } catch (error) {
    console.error('AI 教學建議生成失敗:', error);
    return {
      immediateInterventions: [],
      instructionalStrategies: [],
      differentiation: [],
      parentGuidance: []
    };
  }
};

// 主要診斷函數 - 生成完整的學習診斷結果
export const generateLearningDiagnostic = async (
  session: DiagnosticSession,
  apiKey: string,
  config: DiagnosticReportConfig = {
    includeDetailedAnalysis: true,
    includeComparativeData: false,
    includeVisualCharts: false,
    language: 'zh-TW',
    reportFormat: 'standard'
  }
): Promise<LearningDiagnosticResult> => {
  try {
    // 1. 分析測驗結果
    const performanceStats = analyzeQuizResults(session.responses);
    const overallScore = calculateOverallScore(session.responses);
    const learningLevel = determineLearningLevel(overallScore);

    // 2. 使用AI生成學習分析
    const learningAnalysis = await generateLearningAnalysisWithAI(
      session.topic,
      session.responses,
      performanceStats,
      apiKey
    );

    // 3. 生成個人化建議
    const personalizedRecommendations = await generatePersonalizedRecommendations(
      session.topic,
      overallScore,
      learningLevel,
      learningAnalysis.strengths,
      learningAnalysis.weaknesses,
      apiKey
    );

    // 4. 生成學生版回饋
    const studentFeedback = await generateStudentFeedback(
      session.topic,
      overallScore,
      learningLevel,
      performanceStats,
      learningAnalysis.strengths,
      learningAnalysis.weaknesses,
      apiKey,
      session.studentId,
      session.responses
    );

    // 5. 生成教學建議
    const teachingRecommendations = await generateTeachingRecommendations(
      session.topic,
      overallScore,
      performanceStats,
      learningAnalysis.strengths,
      learningAnalysis.weaknesses,
      apiKey,
      session.responses
    );

    // 6. 組裝老師版報告
    const teacherReport: TeacherDiagnosticReport = {
      studentId: session.studentId,
      assessmentDate: new Date().toISOString(),
      topic: session.topic,
      overallPerformance: {
        totalScore: overallScore,
        level: learningLevel,
        timeSpent: session.endTime && session.startTime 
          ? Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000)
          : 0
      },
      performanceByType: performanceStats,
      learningAnalysis,
      teachingRecommendations,
      personalizedRecommendations,
      progressTracking: {
        keyMetrics: ['正確率提升', '回答速度', '概念理解深度'],
        checkpoints: ['一週後複習', '兩週後小測驗', '一個月後綜合評估'],
        reassessmentSuggestion: '建議在完成建議的學習活動後，於 2-3 週內進行重新評估'
      }
    };

    return {
      session,
      studentFeedback,
      teacherReport,
      rawData: {
        responses: session.responses,
        statistics: performanceStats
      }
    };

  } catch (error) {
    console.error('生成學習診斷失敗:', error);
    throw new Error('無法生成學習診斷報告，請稍後重試');
  }
};

// 輔助函數：創建診斷會話
export const createDiagnosticSession = (
  topic: string,
  studentId?: string
): DiagnosticSession => {
  return {
    sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    studentId,
    topic,
    startTime: new Date().toISOString(),
    responses: [],
    isCompleted: false,
    metadata: {
      userAgent: navigator.userAgent,
      deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
    }
  };
};

// 輔助函數：完成診斷會話
export const completeDiagnosticSession = (session: DiagnosticSession): DiagnosticSession => {
  return {
    ...session,
    endTime: new Date().toISOString(),
    isCompleted: true
  };
};