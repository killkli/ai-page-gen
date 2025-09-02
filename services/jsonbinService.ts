const JSONBIN_API = 'https://api.jsonbin.io/v3/b';
const JSONBIN_KEY = import.meta.env.VITE_JSONBIN_API_KEY; // 請在 .env 設定 VITE_JSONBIN_API_KEY

export async function saveLearningContent(content: any): Promise<string> {
  const response = await fetch(JSONBIN_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': JSONBIN_KEY,
      'X-Bin-Private': 'false', // 公開 bin 方便分享
    },
    body: JSON.stringify(content),
  });
  const result = await response.json();
  if (!result || !result.metadata || !result.metadata.id) {
    throw new Error('無法取得 jsonbin id');
  }
  return result.metadata.id; // binId
}

export async function getLearningContent(binId: string): Promise<any> {
  const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
    // 公開 bin 可不帶 X-Master-Key
    // headers: { 'X-Master-Key': JSONBIN_KEY },
  });
  const result = await response.json();
  if (!result || !result.record) {
    throw new Error('找不到對應的教學方案');
  }
  return result.record;
}

// 專門用於分享測驗內容的函數（支援診斷功能）
export async function saveQuizContent(quizData: { quiz: any, topic: string, apiKey?: string, metadata?: any }): Promise<string> {
  const quizPayload = {
    type: 'quiz', // 標識這是測驗專用分享
    quiz: quizData.quiz,
    topic: quizData.topic,
    apiKey: quizData.apiKey, // 包含API Key以支援學習診斷
    metadata: quizData.metadata,
    createdAt: new Date().toISOString(),
    supportsDiagnostic: !!quizData.apiKey // 標記是否支援診斷功能
  };

  const response = await fetch(JSONBIN_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': JSONBIN_KEY,
      'X-Bin-Private': 'false', // 公開 bin 方便分享
    },
    body: JSON.stringify(quizPayload),
  });
  const result = await response.json();
  if (!result || !result.metadata || !result.metadata.id) {
    throw new Error('無法儲存測驗內容');
  }
  return result.metadata.id; // binId
}

// 專門用於獲取測驗內容的函數（支援診斷功能）
export async function getQuizContent(binId: string): Promise<{ quiz: any, topic: string, apiKey?: string, supportsDiagnostic?: boolean, metadata?: any }> {
  const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
    // 公開 bin 可不帶 X-Master-Key
    // headers: { 'X-Master-Key': JSONBIN_KEY },
  });
  const result = await response.json();
  if (!result || !result.record) {
    throw new Error('找不到對應的測驗內容');
  }
  
  const data = result.record;
  if (data.type !== 'quiz') {
    throw new Error('此連結不是測驗專用分享');
  }
  
  return {
    quiz: data.quiz,
    topic: data.topic,
    apiKey: data.apiKey, // 返回API Key以支援診斷功能
    supportsDiagnostic: data.supportsDiagnostic || false,
    metadata: data.metadata
  };
}

// 專門用於分享寫作練習內容的函數
export async function saveWritingPracticeContent(writingData: { writingPractice: any, topic: string, metadata?: any }): Promise<string> {
  const writingPayload = {
    type: 'writing', // 標識這是寫作練習專用分享
    writingPractice: writingData.writingPractice,
    topic: writingData.topic,
    metadata: writingData.metadata,
    createdAt: new Date().toISOString()
  };

  const response = await fetch(JSONBIN_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': JSONBIN_KEY,
      'X-Bin-Private': 'false', // 公開 bin 方便分享
    },
    body: JSON.stringify(writingPayload),
  });
  const result = await response.json();
  if (!result || !result.metadata || !result.metadata.id) {
    throw new Error('無法儲存寫作練習內容');
  }
  return result.metadata.id; // binId
}

// 專門用於獲取寫作練習內容的函數
export async function getWritingPracticeContent(binId: string): Promise<{ writingPractice: any, topic: string, metadata?: any }> {
  const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
    // 公開 bin 可不帶 X-Master-Key
    // headers: { 'X-Master-Key': JSONBIN_KEY },
  });
  const result = await response.json();
  if (!result || !result.record) {
    throw new Error('找不到對應的寫作練習內容');
  }
  
  const data = result.record;
  if (data.type !== 'writing') {
    throw new Error('此連結不是寫作練習專用分享');
  }
  
  return {
    writingPractice: data.writingPractice,
    topic: data.topic,
    metadata: data.metadata
  };
}

// 儲存學生作答結果供老師檢視
export async function saveStudentResults(resultData: {
  studentName?: string;
  topic: string;
  difficulty: string;
  responses: any[];
  overallScore: number;
  completedAt: string;
  quizBinId?: string; // 原始測驗的 binId
  metadata?: any;
}): Promise<string> {
  const resultPayload = {
    type: 'student-results', // 標識這是學生作答結果
    ...resultData,
    createdAt: new Date().toISOString()
  };

  const response = await fetch(JSONBIN_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': JSONBIN_KEY,
      'X-Bin-Private': 'false', // 公開 bin 方便老師查看
    },
    body: JSON.stringify(resultPayload),
  });
  const result = await response.json();
  if (!result || !result.metadata || !result.metadata.id) {
    throw new Error('無法儲存學生作答結果');
  }
  return result.metadata.id; // binId
}

// 獲取學生作答結果供老師檢視
export async function getStudentResults(binId: string): Promise<{
  studentName?: string;
  topic: string;
  difficulty: string;
  responses: any[];
  overallScore: number;
  completedAt: string;
  quizBinId?: string;
  metadata?: any;
}> {
  const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
    // 公開 bin 可不帶 X-Master-Key
    // headers: { 'X-Master-Key': JSONBIN_KEY },
  });
  const result = await response.json();
  if (!result || !result.record) {
    throw new Error('找不到對應的學生作答結果');
  }
  
  const data = result.record;
  if (data.type !== 'student-results') {
    throw new Error('此連結不是學生作答結果專用分享');
  }
  
  return {
    studentName: data.studentName,
    topic: data.topic,
    difficulty: data.difficulty,
    responses: data.responses,
    overallScore: data.overallScore,
    completedAt: data.completedAt,
    quizBinId: data.quizBinId,
    metadata: data.metadata
  };
}

// 通用分享內容獲取函數（支援完整教案、測驗、寫作練習）
export async function getSharedContent(binId: string): Promise<any> {
  const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
    // 公開 bin 可不帶 X-Master-Key
    // headers: { 'X-Master-Key': JSONBIN_KEY },
  });
  const result = await response.json();
  if (!result || !result.record) {
    throw new Error('找不到對應的分享內容');
  }
  
  return result.record;
} 