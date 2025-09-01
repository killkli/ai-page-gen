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

// 計算整體得分
export const calculateOverallScore = (performances: QuestionTypePerformance[]): number => {
  if (performances.length === 0) return 0;
  
  const weightedScore = performances.reduce((sum, perf) => {
    // 根據題型難度給予不同權重
    let weight = 1;
    const avgDifficultyScore = (
      perf.difficultyBreakdown.easy.accuracy * 0.7 +
      perf.difficultyBreakdown.normal.accuracy * 1.0 +
      perf.difficultyBreakdown.hard.accuracy * 1.3
    ) / 3;
    
    return sum + (avgDifficultyScore * weight);
  }, 0);
  
  return Math.round(weightedScore / performances.length);
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
  const prompt = `
    Based on the quiz performance data for topic "${topic}", provide a comprehensive learning analysis.
    
    Performance Summary:
    ${performances.map(p => `
    - ${p.questionType}: ${p.accuracy}% accuracy (${p.correctCount}/${p.totalQuestions})
      Easy: ${p.difficultyBreakdown.easy.accuracy}%, Normal: ${p.difficultyBreakdown.normal.accuracy}%, Hard: ${p.difficultyBreakdown.hard.accuracy}%
    `).join('\n')}
    
    Total responses analyzed: ${responses.length}
    
    Please provide analysis in the following JSON structure (no explanation, no extra text):
    {
      "strengths": [
        {
          "area": "具體強項領域",
          "description": "詳細描述學生在此領域的表現",
          "level": "good|excellent|outstanding",
          "examples": ["具體表現實例"],
          "leverageOpportunities": ["如何運用此強項的建議"]
        }
      ],
      "weaknesses": [
        {
          "area": "需要改進的領域",
          "description": "詳細描述問題所在",
          "severity": "low|medium|high",
          "affectedTopics": ["受影響的主題"],
          "recommendedActions": ["具體改進行動"]
        }
      ],
      "learningStyle": "推測的學習風格（視覺型/聽覺型/動手型等）",
      "cognitivePattern": "認知模式分析"
    }
    
    Please respond in Traditional Chinese (繁體中文) and focus on educational insights that would be valuable for both students and teachers.
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
  studentId?: string
): Promise<StudentLearningFeedback> => {
  const prompt = `
    Generate encouraging and constructive feedback for a student based on their quiz performance.
    
    Context:
    - Topic: "${topic}"
    - Overall Score: ${overallScore}%
    - Learning Level: ${overallLevel}
    - Strengths: ${strengths.map(s => s.area).join(', ')}
    - Areas for improvement: ${weaknesses.map(w => w.area).join(', ')}
    
    Please provide student-friendly feedback in the following JSON structure (no explanation, no extra text):
    {
      "encouragementMessage": "鼓勵的開場訊息，要正面且具體",
      "keyStrengths": ["主要強項1", "主要強項2", "主要強項3"],
      "improvementAreas": ["需要加強的領域1", "需要加強的領域2"],
      "nextSteps": ["下一步具體行動1", "下一步具體行動2", "下一步具體行動3"],
      "studyTips": ["實用學習小貼士1", "實用學習小貼士2", "實用學習小貼士3"],
      "motivationalQuote": "激勵性的結尾語句"
    }
    
    Use encouraging, positive language appropriate for students. Focus on growth mindset and actionable advice.
    Respond in Traditional Chinese (繁體中文).
  `;

  try {
    const result = await callGeminiForDiagnostic(prompt, apiKey);
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
  apiKey: string
): Promise<{
  immediateInterventions: string[];
  instructionalStrategies: string[];
  differentiation: string[];
  parentGuidance?: string[];
}> => {
  const prompt = `
    Generate comprehensive teaching recommendations based on student assessment results.
    
    Context:
    - Topic: "${topic}"
    - Overall Performance: ${overallScore}%
    - Strengths: ${strengths.map(s => s.area).join(', ')}
    - Areas needing support: ${weaknesses.map(w => w.area).join(', ')}
    - Performance by type: ${performances.map(p => `${p.questionType}: ${p.accuracy}%`).join(', ')}
    
    Please provide teaching recommendations in the following JSON structure (no explanation, no extra text):
    {
      "immediateInterventions": ["立即可採取的教學介入措施1", "立即可採取的教學介入措施2"],
      "instructionalStrategies": ["適合的教學策略1", "適合的教學策略2", "適合的教學策略3"],
      "differentiation": ["差異化教學建議1", "差異化教學建議2"],
      "parentGuidance": ["給家長的指導建議1", "給家長的指導建議2"]
    }
    
    Focus on practical, evidence-based teaching strategies that address the identified strengths and weaknesses.
    Respond in Traditional Chinese (繁體中文).
  `;

  try {
    const result = await callGeminiForDiagnostic(prompt, apiKey);
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
    const overallScore = calculateOverallScore(performanceStats);
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
      session.studentId
    );

    // 5. 生成教學建議
    const teachingRecommendations = await generateTeachingRecommendations(
      session.topic,
      overallScore,
      performanceStats,
      learningAnalysis.strengths,
      learningAnalysis.weaknesses,
      apiKey
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