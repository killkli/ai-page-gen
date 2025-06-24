import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GeneratedLearningContent } from '../types';

export const generateLearningPlan = async (topic: string, apiKey: string): Promise<GeneratedLearningContent> => {
  if (!apiKey) {
    throw new Error("Gemini API 金鑰未設定。無法產生內容。");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-2.5-flash-preview-04-17';

  const prompt = `
    Please generate a comprehensive learning plan for the topic: "${topic}".
    The output MUST be a valid JSON object matching the following structure. Do NOT include any explanatory text before or after the JSON block.
    All text content, including objectives, breakdown, points, activities, and all quiz elements (questions, options, answers, statements) MUST be in the primary language of the input topic "${topic}". If the topic appears to be in Chinese, generate content in Traditional Chinese. If English, generate English content.

    {
      "learningObjectives": ["Objective 1...", "Objective 2...", "Objective 3... (minimum 3)"],
      "contentBreakdown": [
        { "topic": "Sub-topic A", "details": "Brief explanation of A..." },
        { "topic": "Sub-topic B", "details": "Brief explanation of B..." }
      ],
      "confusingPoints": [
        { "point": "Common Misconception X", "clarification": "Detailed explanation..." },
        { "point": "Potential Difficulty Y", "clarification": "How to overcome it..." }
      ],
      "classroomActivities": [
        "Engaging Activity Idea 1 (possibly game-like): Description focusing on interaction and fun...",
        "Interactive Game/Activity Idea 2: Detailed description..."
      ],
      "onlineInteractiveQuiz": {
        "easy": {
          "trueFalse": [
            { "statement": "Easy true/false statement related to '${topic}'.", "isTrue": true, "explanation": "Optional brief explanation for easy question." }
          ],
          "multipleChoice": [
            { "question": "Easy question related to '${topic}'...", "options": ["Option A", "Option B", "Option C"], "correctAnswerIndex": 0 }
          ],
          "fillInTheBlanks": [
            { "sentenceWithBlank": "Easy sentence about '${topic}' with ____ here.", "correctAnswer": "answer_for_blank" }
          ],
          "sentenceScramble": [
            { "originalSentence": "This is an easy sentence related to '${topic}'.", "scrambledWords": ["an", "is", "sentence", "This", "easy", "related", "to", "'${topic}'"] }
          ]
        },
        "normal": {
          "trueFalse": [
            { "statement": "Normal difficulty true/false statement about '${topic}'.", "isTrue": false, "explanation": "Optional brief explanation." }
          ],
          "multipleChoice": [
            { "question": "Normal difficulty question about '${topic}'...", "options": ["A", "B", "C", "D"], "correctAnswerIndex": 1 }
          ],
          "fillInTheBlanks": [
            { "sentenceWithBlank": "Normal sentence about '${topic}' needing a ____.", "correctAnswer": "normal_answer" }
          ],
          "sentenceScramble": [
            { "originalSentence": "This normal sentence regarding '${topic}' needs unscrambling.", "scrambledWords": ["sentence", "needs", "unscrambling", "This", "normal", "regarding", "'${topic}'"] }
          ]
        },
        "hard": {
          "trueFalse": [
            { "statement": "Hard, potentially nuanced true/false statement concerning '${topic}'.", "isTrue": true, "explanation": "Optional explanation for hard question, possibly detailing nuance." }
          ],
          "multipleChoice": [
            { "question": "Hard question that requires thought about '${topic}'...", "options": ["Opt1", "Opt2", "Opt3", "Opt4"], "correctAnswerIndex": 2 }
          ],
          "fillInTheBlanks": [
            { "sentenceWithBlank": "A ____ complex sentence for hard difficulty, related to '${topic}'.", "correctAnswer": "truly" }
          ],
          "sentenceScramble": [
            { "originalSentence": "Unscrambling this hard sentence concerning '${topic}' is a challenge.", "scrambledWords": ["sentence", "challenge", "hard", "is", "a", "Unscrambling", "this", "concerning", "'${topic}'"] }
          ]
        }
      }
    }

    Ensure each quiz type (trueFalse, multipleChoice, fillInTheBlanks, sentenceScramble) has at least 1-2 questions for each difficulty level (easy, normal, hard).
    For True/False questions, the 'statement' MUST be a clear assertion related to the learning topic '${topic}'. 'isTrue' is a boolean. 'explanation' is optional and provides context for the answer.
    For multipleChoice, 'correctAnswerIndex' is the 0-based index of the correct option.
    For fillInTheBlanks, use '____' to denote the blank.
    For sentenceScramble, 'scrambledWords' should be an array of strings.
    Classroom activities should be engaging, interactive, and if possible, incorporate elements of game design or playful learning.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    if (!response.text) {
      throw new Error("AI 回傳內容為空，請重試。");
    }
    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    if (jsonStr.startsWith("Sure, here is the JSON") || jsonStr.startsWith("Here is the JSON")) {
        const jsonStart = jsonStr.indexOf("{");
        const jsonEnd = jsonStr.lastIndexOf("}");
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            jsonStr = jsonStr.substring(jsonStart, jsonEnd + 1);
        }
    }

    const parsedData = JSON.parse(jsonStr) as GeneratedLearningContent;
    return parsedData;

  } catch (error) {
    console.error("Error generating learning plan:", error);
    let errorMessage = "無法產生學習計畫。";
    if (error instanceof Error) {
      errorMessage += ` 詳細資料： ${error.message}`;
    }
    if (error && typeof error === 'object' && 'message' in error) {
        const typedError = error as { message: string, toString: () => string };
        if (typedError.message.includes("API key not valid")) {
             errorMessage = "Gemini API 金鑰無效。請檢查您的設定。";
        } else if (typedError.message.includes("quota")) {
            errorMessage = "已超出 API 配額。請稍後再試。";
        } else if (typedError.message.includes("JSON")) {
             errorMessage = "AI 模型傳回無效的 JSON 格式。請嘗試修改您的主題或重試。";
        }
    }
    throw new Error(errorMessage);
  }
};