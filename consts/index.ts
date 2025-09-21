import { VocabularyLevel } from '../types';
// Hard-coded vocabulary levels from 100-7000 words
export const VOCABULARY_LEVELS: VocabularyLevel[] = [
  {
    id: 'beginner',
    name: '初級 (100-500詞)',
    wordCount: 500,
    description: '適合英語初學者，使用最基本的日常詞彙'
  },
  {
    id: 'elementary',
    name: '基礎 (500-1000詞)',
    wordCount: 1000,
    description: '掌握基本會話詞彙，能進行簡單交流'
  },
  {
    id: 'pre-intermediate',
    name: '初中級 (1000-2000詞)',
    wordCount: 2000,
    description: '能理解日常生活和工作中的常見詞彙'
  },
  {
    id: 'intermediate',
    name: '中級 (2000-3500詞)',
    wordCount: 3500,
    description: '能處理較複雜的文本和學術內容'
  },
  {
    id: 'upper-intermediate',
    name: '中高級 (3500-5000詞)',
    wordCount: 5000,
    description: '能理解專業文章和較複雜的語言結構'
  },
  {
    id: 'advanced',
    name: '高級 (5000-7000詞)',
    wordCount: 7000,
    description: '具備高水平的英語理解和表達能力'
  }
];

