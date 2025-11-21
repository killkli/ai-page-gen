import { GoogleGenAI } from "@google/genai";
import { LRUCache } from 'lru-cache';

// Initialize cache
const responseCache = new LRUCache<string, string>({
    max: 50, // Cache up to 50 responses
    ttl: 1000 * 60 * 60, // 1 hour TTL
});

export const clearCache = () => {
    responseCache.clear();
};

// 單一欄位生成工具
export const callGemini = async (prompt: string, apiKey: string): Promise<any> => {
    if (!apiKey) {
        throw new Error('API Key is required');
    }

    // Check cache
    if (responseCache.has(prompt)) {
        console.log('Serving from cache:', prompt.substring(0, 50) + '...');
        const cachedText = responseCache.get(prompt) as string;
        try {
            return JSON.parse(cachedText);
        } catch (e) {
            console.error("Failed to parse cached JSON:", e);
            responseCache.delete(prompt);
        }
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-1.5-flash';

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
            },
        });

        if (!response.text) throw new Error("AI 回傳內容為空，請重試或檢查 API 金鑰。");
        let jsonStr = response.text.trim();

        // Cache the raw response
        responseCache.set(prompt, jsonStr);

        // 先移除 code block fence
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }

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
        } catch (_err) {
            console.error("AI 回傳原始內容 (JSON parse 失敗):", response.text);
            throw new Error("AI 模型傳回的資料格式無法解析 (可能不是有效的 JSON)。請嘗試修改您的主題或重試。");
        }

    } catch (error) {
        let errorMessage = "無法產生內容。";
        if (error instanceof Error) errorMessage += ` 詳細資料： ${error.message}`;

        if (error && typeof error === 'object' && 'message' in error) {
            const typedError = error as { message: string, toString: () => string };
            if (typedError.message.includes("API key not valid") || typedError.message.includes("API_KEY_INVALID")) {
                errorMessage = "Gemini API 金鑰無效。請檢查您的設定。";
            } else if (typedError.message.includes("quota") || typedError.message.includes("RESOURCE_EXHAUSTED")) {
                errorMessage = "已超出 API 配額。請稍後再試。";
            } else if (typedError.message.toLowerCase().includes("json") || typedError.message.includes("Unexpected token")) {
                errorMessage = "AI 模型傳回的資料格式無法解析 (可能不是有效的 JSON)。請嘗試修改您的主題或重試。";
            }
        }
        console.error("Gemini API Error:", error);
        throw new Error(errorMessage);
    }
};

export const isMathRelatedTopic = (topic: string): boolean => {
    const mathKeywords = [
        'math', 'algebra', 'geometry', 'calculus', 'statistics', 'probability', 'arithmetic', 'trigonometry',
        '數學', '代數', '幾何', '微積分', '統計', '機率', '算術', '三角函數', '分數', '小數', '方程式', '函數'
    ];
    const topicLower = topic.toLowerCase();
    return mathKeywords.some(keyword => topicLower.includes(keyword.toLowerCase()));
};

// 檢測主題是否為英語相關
export const isEnglishRelatedTopic = (topic: string): boolean => {
    const englishKeywords = [
        'english', 'grammar', 'vocabulary', 'pronunciation', 'speaking', 'writing', 'reading', 'listening',
        'conversation', 'toefl', 'ielts', 'toeic', 'english literature', 'business english', 'academic english',
        'phrasal verbs', 'idioms', 'prepositions', 'tenses', 'articles', 'adjectives', 'adverbs', 'nouns', 'verbs',
        '英語', '英文', '文法', '單字', '發音', '口說', '寫作', '閱讀', '聽力',
        '對話', '會話', '托福', '雅思', '多益', '商業英文', '學術英文',
        '片語動詞', '慣用語', '介系詞', '時態', '冠詞', '形容詞', '副詞', '名詞', '動詞'
    ];

    const topicLower = topic.toLowerCase();
    return englishKeywords.some(keyword => topicLower.includes(keyword.toLowerCase()));
};
