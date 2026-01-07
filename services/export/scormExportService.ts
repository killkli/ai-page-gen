import JSZip from 'jszip';
import type { OnlineInteractiveQuiz } from '../../types';

const SCORM_API_WRAPPER = `
var API = {
  LMSInitialize: function() { return "true"; },
  LMSFinish: function() { return "true"; },
  LMSGetValue: function(element) {
    if (element === "cmi.core.lesson_status") return "not attempted";
    if (element === "cmi.core.score.raw") return "";
    return "";
  },
  LMSSetValue: function(element, value) {
    if (element === "cmi.core.lesson_status" || element === "cmi.core.score.raw") {
      console.log("SCORM Set:", element, "=", value);
    }
    return "true";
  },
  LMSCommit: function() { return "true"; },
  LMSGetLastError: function() { return "0"; },
  LMSGetErrorString: function() { return "No Error"; },
  LMSGetDiagnostic: function() { return ""; }
};
window.API = API;
`;

const QUIZ_STYLES = `
* { box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans TC', sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #f8fafc;
  color: #1e293b;
}
h1 { color: #4f46e5; text-align: center; margin-bottom: 30px; }
.question-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.question-text { font-size: 18px; font-weight: 500; margin-bottom: 15px; }
.options { display: flex; flex-direction: column; gap: 10px; }
.option {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.option:hover { border-color: #4f46e5; background: #eef2ff; }
.option.selected { border-color: #4f46e5; background: #c7d2fe; }
.option.correct { border-color: #10b981; background: #d1fae5; }
.option.incorrect { border-color: #ef4444; background: #fee2e2; }
.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary { background: #4f46e5; color: white; }
.btn-primary:hover { background: #4338ca; }
.btn-primary:disabled { background: #cbd5e1; cursor: not-allowed; }
.result-card {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.score { font-size: 48px; font-weight: bold; color: #4f46e5; }
.score-label { font-size: 20px; color: #64748b; margin-top: 10px; }
.hidden { display: none; }
`;

const generateQuizPlayer = () => `
var quiz = null;
var currentQuestion = 0;
var score = 0;
var answers = [];
var totalQuestions = 0;

function loadQuiz() {
  fetch('content/questions.json')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      quiz = [];
      ['easy', 'normal', 'hard'].forEach(function(diff) {
        if (data[diff] && data[diff].trueFalse) {
          data[diff].trueFalse.forEach(function(q, i) {
            quiz.push({
              id: diff + '_tf_' + i,
              type: 'trueFalse',
              difficulty: diff,
              question: q.statement,
              correctAnswer: q.isTrue,
              explanation: q.explanation
            });
          });
        }
        if (data[diff] && data[diff].multipleChoice) {
          data[diff].multipleChoice.forEach(function(q, i) {
            quiz.push({
              id: diff + '_mc_' + i,
              type: 'multipleChoice',
              difficulty: diff,
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswerIndex
            });
          });
        }
      });
      totalQuestions = quiz.length;
      if (totalQuestions > 0) {
        renderQuestion();
      } else {
        document.getElementById('quiz-container').innerHTML = '<p>No questions available.</p>';
      }
      API.LMSInitialize();
      API.LMSSetValue('cmi.core.lesson_status', 'incomplete');
    });
}

function renderQuestion() {
  var q = quiz[currentQuestion];
  var container = document.getElementById('quiz-container');
  var html = '<div class="question-card">';
  html += '<div class="question-text">' + (currentQuestion + 1) + '. ' + q.question + '</div>';
  html += '<div class="options">';
  
  if (q.type === 'trueFalse') {
    html += '<div class="option" data-value="true" onclick="selectOption(this, true)">正確 (True)</div>';
    html += '<div class="option" data-value="false" onclick="selectOption(this, false)">錯誤 (False)</div>';
  } else if (q.type === 'multipleChoice') {
    q.options.forEach(function(opt, i) {
      html += '<div class="option" data-value="' + i + '" onclick="selectOption(this, ' + i + ')">' + opt + '</div>';
    });
  }
  
  html += '</div></div>';
  html += '<button id="next-btn" class="btn btn-primary" onclick="nextQuestion()" disabled>下一題</button>';
  container.innerHTML = html;
  document.getElementById('progress').textContent = '第 ' + (currentQuestion + 1) + ' / ' + totalQuestions + ' 題';
}

var selectedAnswer = null;
function selectOption(el, value) {
  document.querySelectorAll('.option').forEach(function(o) { o.classList.remove('selected'); });
  el.classList.add('selected');
  selectedAnswer = value;
  document.getElementById('next-btn').disabled = false;
}

function nextQuestion() {
  var q = quiz[currentQuestion];
  var isCorrect = false;
  if (q.type === 'trueFalse') {
    isCorrect = selectedAnswer === q.correctAnswer;
  } else if (q.type === 'multipleChoice') {
    isCorrect = selectedAnswer === q.correctAnswer;
  }
  if (isCorrect) score++;
  answers.push({ questionId: q.id, answer: selectedAnswer, correct: isCorrect });
  
  currentQuestion++;
  selectedAnswer = null;
  
  if (currentQuestion < totalQuestions) {
    renderQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  var percent = Math.round((score / totalQuestions) * 100);
  var container = document.getElementById('quiz-container');
  container.innerHTML = '<div class="result-card">' +
    '<div class="score">' + percent + '%</div>' +
    '<div class="score-label">答對 ' + score + ' / ' + totalQuestions + ' 題</div>' +
    '<button class="btn btn-primary" onclick="restartQuiz()" style="margin-top:20px;">重新測驗</button>' +
    '</div>';
  document.getElementById('progress').textContent = '測驗完成';
  
  API.LMSSetValue('cmi.core.score.raw', percent.toString());
  API.LMSSetValue('cmi.core.lesson_status', percent >= 60 ? 'passed' : 'failed');
  API.LMSCommit();
  API.LMSFinish();
}

function restartQuiz() {
  currentQuestion = 0;
  score = 0;
  answers = [];
  selectedAnswer = null;
  renderQuestion();
  API.LMSInitialize();
  API.LMSSetValue('cmi.core.lesson_status', 'incomplete');
}

document.addEventListener('DOMContentLoaded', loadQuiz);
`;

const generateLaunchPage = (topic: string) => `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${topic} - AI 學習測驗</title>
  <link rel="stylesheet" href="styles.css">
  <script src="scorm-api.js"></script>
</head>
<body>
  <h1>${topic}</h1>
  <div id="progress"></div>
  <div id="quiz-container"></div>
  <script src="quiz.js"></script>
</body>
</html>`;

const generateManifest = (
  topic: string
) => `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="AI-LearnGen-Quiz" version="1.0"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="org1">
    <organization identifier="org1">
      <title>${escapeXml(topic)} - AI 學習測驗</title>
      <item identifier="item1" identifierref="res1">
        <title>${escapeXml(topic)}</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="res1" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
      <file href="quiz.js"/>
      <file href="scorm-api.js"/>
      <file href="styles.css"/>
      <file href="content/questions.json"/>
    </resource>
  </resources>
</manifest>`;

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const generateSCORMPackage = async (
  quiz: OnlineInteractiveQuiz,
  topic: string
): Promise<Blob> => {
  const zip = new JSZip();

  zip.file('imsmanifest.xml', generateManifest(topic));
  zip.file('content/questions.json', JSON.stringify(quiz, null, 2));
  zip.file('index.html', generateLaunchPage(topic));
  zip.file('scorm-api.js', SCORM_API_WRAPPER);
  zip.file('quiz.js', generateQuizPlayer());
  zip.file('styles.css', QUIZ_STYLES);

  return await zip.generateAsync({ type: 'blob' });
};

export const downloadSCORMPackage = async (
  quiz: OnlineInteractiveQuiz,
  topic: string
): Promise<void> => {
  const blob = await generateSCORMPackage(quiz, topic);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${topic}_SCORM.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
