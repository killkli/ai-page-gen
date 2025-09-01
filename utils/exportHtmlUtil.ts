import { GeneratedLearningContent, QuizDifficulty, QuizDifficultyContent, TrueFalseQuestion, MultipleChoiceQuestion, FillBlankQuestion, SentenceScrambleQuestion, DialogueLine } from '../types';

const generateInteractiveQuizHtml = (quizDataJson: string): string => {
  return `
    <div class="tabs">
      <button class="tab-btn active" data-tab-target="easy-quiz-content" data-difficulty="easy">簡單</button>
      <button class="tab-btn" data-tab-target="normal-quiz-content" data-difficulty="normal">普通</button>
      <button class="tab-btn" data-tab-target="hard-quiz-content" data-difficulty="hard">困難</button>
    </div>
    <div id="easy-quiz-content" class="tab-content active">
      <!-- Content rendered by JS -->
      <div class="quiz-items-container" data-difficulty="easy"></div>
    </div>
    <div id="normal-quiz-content" class="tab-content">
      <!-- Content rendered by JS -->
      <div class="quiz-items-container" data-difficulty="normal"></div>
    </div>
    <div id="hard-quiz-content" class="tab-content">
      <!-- Content rendered by JS -->
      <div class="quiz-items-container" data-difficulty="hard"></div>
    </div>
    <script type="application/json" id="quizDataStore">
      ${quizDataJson}
    </script>
  `;
};


export const exportLearningContentToHtml = (content: GeneratedLearningContent, topic: string) => {
  const learningObjectivesHtml = content.learningObjectives && content.learningObjectives.length > 0
    ? `<ul>${content.learningObjectives.map(obj => `<li>${obj}</li>`).join('')}</ul>`
    : '<p>沒有提供教學目標。</p>';

  const contentBreakdownHtml = content.contentBreakdown && content.contentBreakdown.length > 0
    ? content.contentBreakdown.map(item => `
        <div class="breakdown-item" style="margin-bottom:24px; padding-bottom:20px; border-bottom:1px solid #e2e8f0;">
          <h3 style="color:#0369a1; margin-bottom:8px;">${item.topic}</h3>
          <p style="margin-bottom:12px; color:#475569;">${item.details}</p>
          
          ${item.coreConcept ? `
            <div style="background:#eff6ff; border-left:4px solid #3b82f6; padding:12px; border-radius:4px; margin-bottom:12px;">
              <strong style="color:#1e40af; font-size:0.85em; display:block; margin-bottom:4px;">核心概念</strong>
              <span style="color:#1e3a8a; font-size:0.9em;">${item.coreConcept}</span>
            </div>` : ''}
          
          ${item.teachingSentences && item.teachingSentences.length > 0 ? `
            <div style="background:#eef2ff; border-left:4px solid #6366f1; padding:12px; border-radius:4px; margin-bottom:12px;">
              <strong style="color:#4338ca; font-size:0.85em; display:block; margin-bottom:8px;">教學例句</strong>
              <div style="line-height:1.6;">
                ${item.teachingSentences.map((sentence, index) => `
                  <div style="color:#312e81; font-size:0.9em; margin-bottom:4px;">
                    <span style="color:#6366f1; font-family:monospace;">${index + 1}.</span> ${sentence}
                  </div>
                `).join('')}
              </div>
            </div>` : ''}
          
          ${item.teachingTips ? `
            <div style="background:#faf5ff; border-left:4px solid #8b5cf6; padding:12px; border-radius:4px; margin-bottom:12px;">
              <strong style="color:#7c3aed; font-size:0.85em; display:block; margin-bottom:4px;">教學要點提示</strong>
              <span style="color:#6b21a8; font-size:0.9em;">${item.teachingTips}</span>
            </div>` : ''}
          
          ${item.teachingExample ? `
            <div style="background:#f0f9ff; border-left:4px solid #0ea5e9; padding:12px; border-radius:4px;">
              <strong style="color:#0284c7; font-size:0.85em; display:block; margin-bottom:4px;">教學示例</strong>
              <span style="color:#0c4a6e; font-size:0.9em;">${item.teachingExample}</span>
            </div>` : ''}
        </div>`).join('')
    : '<p>沒有提供內容分解。</p>';

  const confusingPointsHtml = content.confusingPoints && content.confusingPoints.length > 0
    ? content.confusingPoints.map(item => `
        <div class="confusing-point-item">
          <h3>${item.point}</h3>
          <p>${item.clarification}</p>
        </div>`).join('')
    : '<p>沒有提供易混淆點。</p>';

  const classroomActivitiesHtml = content.classroomActivities && content.classroomActivities.length > 0
    ? content.classroomActivities.map(activity => `
        <div class="activity-item" style="border:1px solid #e0e7ef; border-radius:6px; padding:16px; margin-bottom:16px; background:#f8fafc;">
          <h3 style="color:#2563eb; margin-bottom:8px; font-size:1.2em;">${activity.title}</h3>
          <p style="margin-bottom:12px; color:#475569;">${activity.description}</p>
          
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
            ${activity.objective ? `
              <div>
                <strong style="color:#0f172a;">學習目標：</strong>
                <p style="margin:4px 0 0 0; font-size:0.9em;">${activity.objective}</p>
              </div>` : ''}
            ${activity.timing ? `
              <div>
                <strong style="color:#0f172a;">使用時機：</strong>
                <p style="margin:4px 0 0 0; font-size:0.9em;">${activity.timing}</p>
              </div>` : ''}
            ${activity.materials ? `
            <div>
              <strong style="color:#0f172a;">所需教具：</strong>
              <p style="margin:4px 0 0 0; font-size:0.9em;">${activity.materials}</p>
            </div>` : ''}
            ${activity.environment ? `
            <div>
              <strong style="color:#0f172a;">環境要求：</strong>
              <p style="margin:4px 0 0 0; font-size:0.9em;">${activity.environment}</p>
            </div>` : ''}
          </div>
          
          ${activity.steps && activity.steps.length > 0 ? `
            <div style="margin-bottom:12px;">
              <strong style="color:#0f172a;">活動步驟：</strong>
              <ol style="margin:8px 0 0 20px; padding:0;">
                ${activity.steps.map(step => `<li style="margin-bottom:4px; font-size:0.9em;">${step}</li>`).join('')}
              </ol>
            </div>` : ''}
          
          ${activity.assessmentPoints && activity.assessmentPoints.length > 0 ? `
            <div>
              <strong style="color:#0f172a;">評估重點：</strong>
              <ul style="margin:8px 0 0 20px; padding:0;">
                ${activity.assessmentPoints.map(point => `<li style="margin-bottom:4px; font-size:0.9em;">${point}</li>`).join('')}
              </ul>
            </div>` : ''}
        </div>
      `).join('')
    : '<p>沒有提供課堂活動。</p>';

  const englishConversationHtml = content.englishConversation && content.englishConversation.length > 0
    ? content.englishConversation.map(line => `
        <div class="dialogue-line ${line.speaker === 'Speaker A' ? 'speakerA' : 'speakerB'}">
          <span class="speaker">${line.speaker}:</span> ${line.line}
        </div>`).join('') + '<p><small><em>注意：互動式語音朗讀和練習功能僅在線上應用程式中提供。</em></small></p>'
    : '<p>沒有提供英文對話內容。</p>';
  
  const learningLevelsHtml = content.learningLevels && content.learningLevels.suggestedLevels && content.learningLevels.suggestedLevels.length > 0
    ? content.learningLevels.suggestedLevels
        .sort((a, b) => a.order - b.order)
        .map(level => `
          <div class="level-item" style="border:1px solid #e0e7ef; border-radius:8px; padding:16px; margin-bottom:12px; background:${level.id === content.learningLevels.defaultLevelId ? '#eff8ff' : '#f8fafc'}; border-left: 4px solid ${level.id === content.learningLevels.defaultLevelId ? '#0ea5e9' : '#e2e8f0'};">
            <div style="display:flex; align-items:center; margin-bottom:8px;">
              <div style="width:32px; height:32px; border-radius:50%; background-color:${level.id === content.learningLevels.defaultLevelId ? '#0ea5e9' : '#94a3b8'}; color:white; display:flex; align-items:center; justify-content:center; font-weight:bold; margin-right:12px;">${level.order}</div>
              <h3 style="margin:0; color:${level.id === content.learningLevels.defaultLevelId ? '#0c4a6e' : '#334155'};">${level.name}</h3>
              ${level.id === content.learningLevels.defaultLevelId ? '<span style="background:#dcfce7; color:#166534; padding:2px 8px; border-radius:4px; font-size:0.8em; margin-left:8px;">預設</span>' : ''}
            </div>
            <p style="margin:0; color:#64748b; line-height:1.5;">${level.description}</p>
          </div>
        `).join('')
    : '<p>沒有提供學習程度建議。</p>';

  const quizDataJson = JSON.stringify(content.onlineInteractiveQuiz || {});
  const interactiveQuizzesHtml = generateInteractiveQuizHtml(quizDataJson);

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="zh-Hant">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>學習計畫：${topic}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; margin: 0; padding: 20px; line-height: 1.6; background-color: #f4f7f9; color: #333; }
        .container { max-width: 800px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; text-align: center; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        h2 { color: #3498db; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 8px;}
        h3 { color: #2980b9; margin-top: 20px; }
        h4 { color: #16a085; margin-top:15px; font-size: 1.1em; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px dashed #bdc3c7;}
        ul { list-style-type: disc; padding-left: 20px; }
        li { margin-bottom: 8px; }
        p { margin-bottom: 10px; }
        .section { margin-bottom: 25px; }
        .breakdown-item, .confusing-point-item { border-left: 3px solid #3498db; padding-left: 15px; margin-bottom: 15px; background-color: #fdfdfe; padding:10px; border-radius: 0 4px 4px 0;}
        .dialogue-line { margin-bottom: 8px; padding: 10px; border-radius: 5px; }
        .dialogue-line .speaker { font-weight: bold; color: #0056b3; }
        .dialogue-line.speakerA { background-color: #e7f3ff; border-left: 3px solid #79a6dc; }
        .dialogue-line.speakerB { background-color: #e6fff0; border-left: 3px solid #68d19a; }
        
        .tabs { display: flex; margin-bottom: 0; border-bottom: 1px solid #ccc;}
        .tabs button { padding: 10px 15px; cursor: pointer; border: 1px solid #ccc; background-color: #f0f0f0; margin-right: 0px; border-bottom: none; border-radius: 5px 5px 0 0; font-size: 1em;}
        .tabs button.active { background-color: #fff; border-bottom: 1px solid #fff; color: #3498db; font-weight: bold; position:relative; top:1px;}
        .tab-content { display: none; padding: 15px; border: 1px solid #ccc; border-top: none; background-color:#fff; border-radius: 0 0 5px 5px;}
        .tab-content.active { display: block; }

        .quiz-item { border: 1px solid #e0e0e0; padding: 15px; margin-bottom: 15px; border-radius: 5px; background: #f9f9f9; }
        .quiz-question { font-weight: 500; margin-bottom: 8px; color: #333; }
        .quiz-item p:first-child { margin-top: 0; }
        .quiz-feedback { padding: 8px; margin-top: 10px; border-radius: 4px; font-size: 0.9em; }
        .quiz-feedback.correct { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .quiz-feedback.incorrect { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .quiz-feedback em { color: #555;}
        
        .tf-options button { margin-right: 10px; padding: 8px 12px; border-radius: 4px; border: 1px solid #ccc; cursor: pointer; }
        .tf-options button.selected.correct, .tf-options button.correct { background-color: #28a745; color: white; border-color: #28a745; }
        .tf-options button.selected.incorrect, .tf-options button.incorrect { background-color: #dc3545; color: white; border-color: #dc3545; }
        .tf-options button:disabled { opacity: 0.7; cursor: not-allowed; }

        .mc-options label { display: block; margin-bottom: 8px; padding: 8px; border: 1px solid #eee; border-radius: 4px; cursor: pointer; transition: background-color 0.2s, border-color 0.2s; }
        .mc-options label:hover { background-color: #f0f8ff; }
        .mc-options input[type="radio"] { margin-right: 8px; }
        .mc-options label.selected { background-color: #e0f0ff; border-color: #79a6dc; }
        .mc-options label.correct-answer { background-color: #d4edda !important; border-color: #c3e6cb !important; color: #155724;}
        .mc-options label.incorrect-selection { background-color: #f8d7da !important; border-color: #f5c6cb !important; color: #721c24;}
        .mc-options label.disabled { cursor: not-allowed; opacity: 0.7; }


        .fb-input { padding: 6px; border: 1px solid #ccc; border-radius: 4px; margin: 0 5px; min-width:100px; }
        .fb-input:disabled { background-color: #eee; }

        .ss-word-bank, .ss-constructed-sentence-area { display: flex; flex-wrap: wrap; gap: 8px; padding: 10px; border: 1px dashed #ccc; border-radius: 4px; min-height: 40px; margin-bottom: 10px; }
        .ss-word-bank { background-color: #f0f8ff; }
        .ss-constructed-sentence-area { background-color: #e6fff0; }
        .ss-word-bank button, .ss-constructed-sentence-area button { padding: 5px 10px; background-color: #add8e6; border: none; border-radius: 4px; cursor: pointer; font-size: 0.95em;}
        .ss-word-bank button:hover, .ss-constructed-sentence-area button:hover { background-color: #90cce0; }
        .ss-constructed-sentence-area button { background-color: #a2d2ff; }


        .quiz-item button.check-answer-btn, .quiz-item button.ss-action-btn {
          background-color: #3498db; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-size: 0.9em; margin-top: 10px; transition: background-color 0.2s;
        }
        .quiz-item button.check-answer-btn:hover, .quiz-item button.ss-action-btn:hover { background-color: #2980b9; }
        .quiz-item button.ss-action-btn.ss-clear { background-color: #e74c3c; margin-left: 5px;}
        .quiz-item button.ss-action-btn.ss-clear:hover { background-color: #c0392b; }
        .quiz-item button:disabled, .quiz-item button.check-answer-btn:disabled, .quiz-item button.ss-action-btn:disabled { background-color: #bdc3c7; cursor: not-allowed; opacity: 0.7;}
        
        footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 0.9em; color: #777; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>學習計畫：${topic}</h1>

        <div class="section">
          <h2>學習程度建議</h2>
          ${learningLevelsHtml}
        </div>

        <div class="section">
          <h2>教學目標設定</h2>
          ${learningObjectivesHtml}
        </div>

        <div class="section">
          <h2>分解學習內容</h2>
          ${contentBreakdownHtml}
        </div>

        <div class="section">
          <h2>易混淆點識別</h2>
          ${confusingPointsHtml}
        </div>

        <div class="section">
          <h2>課堂活動與遊戲設計</h2>
          ${classroomActivitiesHtml}
        </div>
        
        <div class="section">
          <h2>英文對話練習</h2>
          ${englishConversationHtml}
        </div>

        <div class="section">
          <h2>線上互動測驗</h2>
          ${interactiveQuizzesHtml}
        </div>
        
        <footer>
          <p>此學習計畫由 AI 產生。匯出時間：${new Date().toLocaleString()}</p>
        </footer>
      </div>

      <script>
        document.addEventListener('DOMContentLoaded', () => {
          const quizData = JSON.parse(document.getElementById('quizDataStore').textContent || '{}');
          let sentenceScrambleStates = {}; // To store dynamic state for sentence scramble

          const normalizeText = (str) => {
            if (typeof str !== 'string') return '';
            // Corrected regex for multiple spaces: \s+ instead of \\s+
            return str.toLowerCase().replace(/[.,!?;:'"‘'""]/g, '').replace(/\s+/g, ' ').trim();
          };

          const renderQuizzesForDifficulty = (difficulty) => {
            const container = document.querySelector(\`.quiz-items-container[data-difficulty="\${difficulty}"]\`);
            if (!container) return;
            container.innerHTML = ''; 
            sentenceScrambleStates[difficulty] = {}; // Reset states for this difficulty

            const difficultyData = quizData[difficulty];
            if (!difficultyData || Object.keys(difficultyData).every(type => !difficultyData[type] || difficultyData[type].length === 0)) {
              container.innerHTML = '<p>此難度沒有測驗資料。</p>';
              return;
            }

            let itemGlobalIndex = 0;
            const typeLabels = { trueFalse: "是非題", multipleChoice: "選擇題", fillInTheBlanks: "填空題", sentenceScramble: "句子重組"};

            const createHtml = (type, q, index) => {
              const questionId = \`\${difficulty}-\${type}-\${index}\`;
              let itemHtml = \`<div class="quiz-item \${type}-item" id="item-\${questionId}">\`;
              
              if (type === 'trueFalse') {
                itemHtml += \`<p class="quiz-question">\${itemGlobalIndex + 1}. \${q.statement}</p>\`;
                itemHtml += \`<div class="tf-options">\`;
                itemHtml += \`<button data-value="true" data-question-id="\${questionId}">是 (True)</button>\`;
                itemHtml += \`<button data-value="false" data-question-id="\${questionId}">非 (False)</button>\`;
                itemHtml += \`</div>\`;
              } else if (type === 'multipleChoice') {
                itemHtml += \`<p class="quiz-question">\${itemGlobalIndex + 1}. \${q.question}</p>\`;
                itemHtml += \`<div class="mc-options">\`;
                q.options.forEach((opt, optIndex) => {
                  itemHtml += \`<label><input type="radio" name="mc-\${questionId}" value="\${optIndex}"> \${String.fromCharCode(65 + optIndex)}. \${opt}</label>\`;
                });
                itemHtml += \`</div>\`;
                itemHtml += \`<button class="check-answer-btn mc-check" data-question-id="\${questionId}">檢查答案</button>\`;
              } else if (type === 'fillInTheBlanks') {
                itemHtml += \`<p class="quiz-question">\${itemGlobalIndex + 1}. \${q.sentenceWithBlank.replace('____', '<input type="text" class="fb-input" id="fb-input-\${questionId}" placeholder="答案">')}</p>\`;
                itemHtml += \`<button class="check-answer-btn fb-check" data-question-id="\${questionId}">檢查答案</button>\`;
              } else if (type === 'sentenceScramble') {
                sentenceScrambleStates[difficulty][questionId] = {
                    availableWords: q.scrambledWords.slice().sort(() => Math.random() - 0.5),
                    constructedWords: []
                };
                itemHtml += \`<p class="quiz-question">\${itemGlobalIndex + 1}. 請重組以下詞彙來形成一個正確的句子：</p>\`;
                itemHtml += \`<p class="ss-instruction">點擊下方詞彙將其加入您的句子，或點擊您句子中的詞彙將其移回詞彙庫。</p>\`
                itemHtml += \`<div class="ss-word-bank" id="ss-bank-\${questionId}">\`;
                sentenceScrambleStates[difficulty][questionId].availableWords.forEach(word => {
                   itemHtml += \`<button class="ss-word" data-word="\${word}" data-question-id="\${questionId}" data-source="bank">\${word}</button>\`;
                });
                itemHtml += \`</div>\`;
                itemHtml += \`<p class="quiz-question">您的句子：</p><div class="ss-constructed-sentence-area" id="ss-area-\${questionId}"></div>\`;
                itemHtml += \`<button class="check-answer-btn ss-check" data-question-id="\${questionId}">檢查句子</button>\`;
                itemHtml += \`<button class="ss-action-btn ss-clear" data-question-id="\${questionId}">清除</button>\`;
              }
              itemHtml += \`<div class="quiz-feedback" id="feedback-\${questionId}"></div></div>\`;
              itemGlobalIndex++;
              return itemHtml;
            };
            
            const quizTypes = ['trueFalse', 'multipleChoice', 'fillInTheBlanks', 'sentenceScramble'];
            let hasContentForDifficulty = false;

            quizTypes.forEach(type => {
              if (difficultyData[type] && difficultyData[type].length > 0) {
                hasContentForDifficulty = true;
                const typeHeader = document.createElement('h4');
                typeHeader.textContent = typeLabels[type];
                container.appendChild(typeHeader);
                difficultyData[type].forEach((q, i) => {
                  const questionElement = document.createElement('div');
                  questionElement.innerHTML = createHtml(type, q, i);
                  container.appendChild(questionElement.firstChild);
                });
              }
            });
             if (!hasContentForDifficulty) {
                 container.innerHTML = '<p>此難度沒有可用的測驗題目。</p>';
            }
          };

          const tabButtons = document.querySelectorAll('.tabs .tab-btn');
          const tabContents = document.querySelectorAll('.tab-content');

          tabButtons.forEach(button => {
            button.addEventListener('click', () => {
              tabButtons.forEach(btn => btn.classList.remove('active'));
              tabContents.forEach(content => content.classList.remove('active'));

              button.classList.add('active');
              const targetContentId = button.getAttribute('data-tab-target');
              document.getElementById(targetContentId).classList.add('active');
              
              const difficulty = button.getAttribute('data-difficulty');
              renderQuizzesForDifficulty(difficulty);
            });
          });
          
          // Initial render for the default active tab
          renderQuizzesForDifficulty('easy');


          // Event delegation for quiz interactions
          document.querySelector('.container').addEventListener('click', (event) => {
            const target = event.target;
            // Ensure target is an HTMLElement before trying to access attributes or match selectors
            if (!(target instanceof HTMLElement)) return;

            const questionId = target.getAttribute('data-question-id');
            if (!questionId) return;

            const [difficulty, type, indexStr] = questionId.split('-');
            const index = parseInt(indexStr);
            const questionData = quizData[difficulty]?.[type]?.[index];
            const feedbackEl = document.getElementById(\`feedback-\${questionId}\`);

            if (!questionData || !feedbackEl) return;

            // True/False
            if (target.matches('.tf-options button')) {
              const selectedValue = target.getAttribute('data-value') === 'true';
              const isCorrect = selectedValue === questionData.isTrue;
              feedbackEl.className = 'quiz-feedback ' + (isCorrect ? 'correct' : 'incorrect');
              let message = isCorrect ? '答對了！' : \`答錯了。正確答案是：\${questionData.isTrue ? '是 (True)' : '非 (False)'}\`;
              if (questionData.explanation) message += \` <em>\${questionData.explanation}</em>\`;
              feedbackEl.innerHTML = message;
              
              target.classList.add('selected', isCorrect ? 'correct' : 'incorrect');
              Array.from(target.parentElement.children).forEach(btn => btn.disabled = true);
            }

            // Multiple Choice Check
            else if (target.matches('.mc-check')) {
              const selectedRadio = document.querySelector(\`input[name="mc-\${questionId}"]:checked\`);
              if (!selectedRadio) {
                feedbackEl.className = 'quiz-feedback incorrect';
                feedbackEl.textContent = '請選擇一個選項。';
                return;
              }
              const selectedOptionIndex = parseInt(selectedRadio.value);
              const isCorrect = selectedOptionIndex === questionData.correctAnswerIndex;
              
              feedbackEl.className = 'quiz-feedback ' + (isCorrect ? 'correct' : 'incorrect');
              let message = isCorrect ? '答對了！' : \`答錯了。正確答案是：\${String.fromCharCode(65 + questionData.correctAnswerIndex)}. \${questionData.options[questionData.correctAnswerIndex]}\`;
              feedbackEl.innerHTML = message;

              // Visually mark options
              const optionLabels = document.querySelectorAll(\`#item-\${questionId} .mc-options label\`);
              optionLabels.forEach((label, idx) => {
                label.classList.add('disabled');
                const radioInLabel = label.querySelector('input');
                if (radioInLabel) radioInLabel.disabled = true;

                if (idx === questionData.correctAnswerIndex) {
                    label.classList.add('correct-answer');
                }
                if (idx === selectedOptionIndex && !isCorrect) {
                    label.classList.add('incorrect-selection');
                }
                 if (idx === selectedOptionIndex) {
                    label.classList.add('selected');
                }
              });
              target.disabled = true;
            }

            // Fill in the Blanks Check
            else if (target.matches('.fb-check')) {
              const inputEl = document.getElementById(\`fb-input-\${questionId}\`);
              // Add null check for inputEl
              if (!inputEl) {
                  console.error('Fill-in-the-blanks input element not found for ID:', \`fb-input-\${questionId}\`);
                  feedbackEl.className = 'quiz-feedback incorrect';
                  feedbackEl.textContent = '發生錯誤：找不到輸入欄位。';
                  return;
              }
              const userAnswer = inputEl.value.trim();
              if (userAnswer === '') {
                feedbackEl.className = 'quiz-feedback incorrect';
                feedbackEl.textContent = '請輸入答案。';
                return;
              }
              const isCorrect = normalizeText(userAnswer) === normalizeText(questionData.correctAnswer);
              feedbackEl.className = 'quiz-feedback ' + (isCorrect ? 'correct' : 'incorrect');
              feedbackEl.textContent = isCorrect ? '答對了！' : \`答錯了。正確答案是： "\${questionData.correctAnswer}"\`;
              inputEl.disabled = true;
              target.disabled = true;
            }
            
            // Sentence Scramble
            else if (target.matches('.ss-word') || target.matches('.ss-check') || target.matches('.ss-clear')) {
                const state = sentenceScrambleStates[difficulty][questionId];
                if (!state) return; // Should not happen if initialized correctly

                const bankEl = document.getElementById(\`ss-bank-\${questionId}\`);
                const areaEl = document.getElementById(\`ss-area-\${questionId}\`);
                
                if(!bankEl || !areaEl) return;


                const redrawScramble = () => {
                    bankEl.innerHTML = '';
                    state.availableWords.forEach(w => {
                        bankEl.innerHTML += \`<button class="ss-word" data-word="\${w}" data-question-id="\${questionId}" data-source="bank">\${w}</button>\`;
                    });
                    areaEl.innerHTML = '';
                    state.constructedWords.forEach(w => {
                        areaEl.innerHTML += \`<button class="ss-word" data-word="\${w}" data-question-id="\${questionId}" data-source="area">\${w}</button>\`;
                    });
                };

                if (target.matches('.ss-word')) {
                    const word = target.getAttribute('data-word');
                    const source = target.getAttribute('data-source');
                    if (source === 'bank') {
                        state.constructedWords.push(word);
                        // Correctly remove only one instance of the word from availableWords
                        const wordIndexInBank = state.availableWords.indexOf(word);
                        if (wordIndexInBank > -1) {
                            state.availableWords.splice(wordIndexInBank, 1);
                        }
                    } else { // source === 'area'
                        state.availableWords.push(word);
                        // Correctly remove only one instance of the word from constructedWords
                        const wordIndexInArea = state.constructedWords.indexOf(word);
                        if (wordIndexInArea > -1) {
                            state.constructedWords.splice(wordIndexInArea, 1);
                        }
                    }
                    redrawScramble();
                    feedbackEl.textContent = '';
                    feedbackEl.className = 'quiz-feedback';
                } else if (target.matches('.ss-check')) {
                    const userAnswer = state.constructedWords.join(' ').trim();
                    const isCorrect = normalizeText(userAnswer) === normalizeText(questionData.originalSentence);
                    feedbackEl.className = 'quiz-feedback ' + (isCorrect ? 'correct' : 'incorrect');
                    feedbackEl.textContent = isCorrect ? '答對了！' : \`答錯了。正確句子是： "\${questionData.originalSentence}"\`;
                    target.disabled = true;
                    const clearButton = document.querySelector(\`#item-\${questionId} .ss-clear\`);
                    if(clearButton) clearButton.disabled = true;
                    
                    bankEl.querySelectorAll('button').forEach(b => b.disabled = true);
                    areaEl.querySelectorAll('button').forEach(b => b.disabled = true);

                } else if (target.matches('.ss-clear')) {
                    state.availableWords = questionData.scrambledWords.slice().sort(() => Math.random() - 0.5);
                    state.constructedWords = [];
                    redrawScramble();
                    feedbackEl.textContent = '';
                    feedbackEl.className = 'quiz-feedback';
                }
            }

          });
        });
      </script>
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `learning-plan-${topic.replace(/\s+/g, '_') || 'untitled'}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
