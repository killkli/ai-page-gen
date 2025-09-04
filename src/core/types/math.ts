/**
 * 數學學習專業類型定義
 */

import { BaseLearningContent, BaseQuizQuestion, BaseUserInteraction, BaseEntity, DifficultyLevel } from './base';

// 數學領域類型
export type MathDomain = 
  | 'arithmetic'     // 算術
  | 'algebra'        // 代數
  | 'geometry'       // 幾何
  | 'trigonometry'   // 三角學
  | 'calculus'       // 微積分
  | 'statistics'     // 統計學
  | 'probability'    // 機率論
  | 'discrete'       // 離散數學
  | 'linear-algebra' // 線性代數
  | 'number-theory'  // 數論
  | 'topology'       // 拓撲學
  | 'analysis';      // 數學分析

// 數學等級系統（學校階段）
export type MathGradeLevel = 
  | 'elementary'     // 小學 1-6年級
  | 'middle-school'  // 中學 7-9年級
  | 'high-school'    // 高中 10-12年級
  | 'undergraduate'  // 大學本科
  | 'graduate'       // 研究所
  | 'advanced';      // 高等數學

// 數學學習內容
export interface MathLearningContent extends BaseLearningContent {
  domain: MathDomain;
  gradeLevel: MathGradeLevel;
  concepts: MathConcept[];
  theorems: MathTheorem[];
  formulas: MathFormula[];
  examples: WorkedExample[];
  exercises: MathExercise[];
  visualizations: MathVisualization[];
  prerequisites: string[]; // 前置概念ID
  applications: RealWorldApplication[];
}

// 數學概念
export interface MathConcept extends BaseEntity {
  name: string;
  domain: MathDomain;
  gradeLevel: MathGradeLevel;
  definition: string;
  intuition: string; // 直觀解釋
  prerequisites: string[]; // 前置概念
  properties: ConceptProperty[];
  commonMisconceptions: Misconception[];
  keyInsights: string[];
  relatedConcepts: ConceptRelation[];
  difficulty: number; // 1-10 概念複雜度
  importance: number; // 1-10 重要程度
}

// 概念屬性
export interface ConceptProperty {
  name: string;
  description: string;
  mathematicalStatement: string;
  proof?: ProofStructure;
  examples: string[];
  counterexamples?: string[];
}

// 常見誤解
export interface Misconception {
  description: string;
  commonError: string;
  correctUnderstanding: string;
  explanation: string;
  preventionStrategy: string;
  remediation: RemediationStrategy[];
}

// 補救策略
export interface RemediationStrategy {
  approach: string;
  activities: string[];
  resources: string[];
  expectedOutcome: string;
}

// 概念關聯
export interface ConceptRelation {
  relatedConceptId: string;
  relationship: ConceptRelationshipType;
  strength: number; // 1-10 關聯強度
  explanation: string;
}

// 概念關係類型
export type ConceptRelationshipType = 
  | 'prerequisite'   // 前置
  | 'builds-on'      // 建立在...之上
  | 'generalizes'    // 一般化
  | 'specializes'    // 特殊化
  | 'analogous'      // 類比
  | 'contrasts'      // 對比
  | 'applies-to'     // 應用於
  | 'equivalent';    // 等價

// 數學定理
export interface MathTheorem extends BaseEntity {
  name: string;
  statement: string;
  hypothesis: string[]; // 假設條件
  conclusion: string;
  proof: ProofStructure;
  applications: TheoremApplication[];
  significance: string;
  historicalContext?: string;
  relatedTheorems: string[];
  difficulty: DifficultyLevel;
}

// 定理應用
export interface TheoremApplication {
  context: string;
  example: string;
  explanation: string;
  significance: string;
}

// 證明結構
export interface ProofStructure {
  type: ProofType;
  steps: ProofStep[];
  keyIdeas: string[];
  techniques: ProofTechnique[];
  alternatives?: AlternativeProof[];
}

// 證明類型
export type ProofType = 
  | 'direct'         // 直接證明
  | 'contradiction'  // 反證法
  | 'contrapositive' // 對偶證明
  | 'induction'      // 數學歸納法
  | 'construction'   // 構造證明
  | 'existence'      // 存在性證明
  | 'uniqueness';    // 唯一性證明

// 證明步驟
export interface ProofStep {
  stepNumber: number;
  statement: string;
  justification: string;
  referencedTheorems?: string[];
  referencedDefinitions?: string[];
  logicalConnector: LogicalConnector;
  visualAid?: VisualAid;
}

// 邏輯連接詞
export type LogicalConnector = 
  | 'given'
  | 'assume'
  | 'since'
  | 'therefore'
  | 'because'
  | 'suppose'
  | 'let'
  | 'consider'
  | 'note-that'
  | 'it-follows'
  | 'conclude';

// 證明技巧
export type ProofTechnique = 
  | 'algebraic-manipulation'
  | 'substitution'
  | 'case-analysis'
  | 'contradiction'
  | 'pigeonhole-principle'
  | 'extremal-principle'
  | 'invariant'
  | 'symmetry';

// 替代證明
export interface AlternativeProof {
  name: string;
  approach: string;
  steps: ProofStep[];
  advantages: string[];
  whenToUse: string;
}

// 視覺輔助
export interface VisualAid {
  type: VisualAidType;
  description: string;
  imageUrl?: string;
  interactiveUrl?: string;
  svgContent?: string;
}

// 視覺輔助類型
export type VisualAidType = 
  | 'diagram'
  | 'graph'
  | 'chart'
  | 'geometric-figure'
  | 'number-line'
  | 'coordinate-system'
  | 'tree-diagram'
  | 'flowchart'
  | 'animation'
  | '3d-model';

// 數學公式
export interface MathFormula extends BaseEntity {
  name: string;
  domain: MathDomain;
  latex: string;
  description: string;
  variables: Variable[];
  conditions: string[]; // 適用條件
  derivation?: FormulaDerivation;
  applications: FormulaApplication[];
  variations: FormulaVariation[];
  memoryAids: string[]; // 記憶技巧
}

// 變數定義
export interface Variable {
  symbol: string;
  name: string;
  description: string;
  domain?: string; // 定義域
  units?: string; // 單位
  constraints?: string[]; // 約束條件
}

// 公式推導
export interface FormulaDerivation {
  startingPoint: string;
  steps: DerivationStep[];
  assumptions: string[];
  references: string[];
}

// 推導步驟
export interface DerivationStep {
  expression: string; // LaTeX
  explanation: string;
  rule: string; // 使用的規則或定理
}

// 公式應用
export interface FormulaApplication {
  context: string;
  problem: string;
  solution: string;
  explanation: string;
}

// 公式變形
export interface FormulaVariation {
  name: string;
  latex: string;
  whenToUse: string;
  examples: string[];
}

// 數學表達式
export interface MathExpression {
  latex: string;
  ascii: string;
  description: string;
  variables: Variable[];
  evaluation?: ExpressionEvaluation;
}

// 表達式計算
export interface ExpressionEvaluation {
  result: string | number;
  steps: CalculationStep[];
  approximation?: number;
  precision?: number;
}

// 計算步驟
export interface CalculationStep {
  expression: string;
  operation: string;
  result: string | number;
  explanation: string;
}

// 幾何圖形
export interface GeometricShape extends BaseEntity {
  type: GeometryType;
  coordinates: Point[];
  properties: GeometricProperty[];
  labels: ShapeLabel[];
  constraints: GeometricConstraint[];
  measurements: ShapeMeasurement[];
  transformations?: GeometricTransformation[];
}

// 幾何類型
export type GeometryType = 
  | 'point'
  | 'line'
  | 'ray'
  | 'segment'
  | 'circle'
  | 'ellipse'
  | 'triangle'
  | 'quadrilateral'
  | 'polygon'
  | 'polyhedron'
  | 'sphere'
  | 'cylinder'
  | 'cone'
  | 'curve'
  | 'surface';

// 點座標
export interface Point {
  x: number;
  y: number;
  z?: number; // 3D
  label?: string;
}

// 幾何性質
export interface GeometricProperty {
  name: string;
  value: string | number;
  unit?: string;
  formula?: string;
  depends: string[]; // 依賴的其他性質
}

// 形狀標籤
export interface ShapeLabel {
  text: string;
  position: Point;
  fontSize?: number;
  color?: string;
}

// 幾何約束
export interface GeometricConstraint {
  type: ConstraintType;
  description: string;
  parameters: Record<string, any>;
}

// 約束類型
export type ConstraintType = 
  | 'distance'
  | 'angle'
  | 'parallel'
  | 'perpendicular'
  | 'tangent'
  | 'concentric'
  | 'collinear'
  | 'congruent'
  | 'similar';

// 形狀測量
export interface ShapeMeasurement {
  type: MeasurementType;
  value: number;
  unit: string;
  precision: number;
  formula?: string;
}

// 測量類型
export type MeasurementType = 
  | 'length'
  | 'width'
  | 'height'
  | 'radius'
  | 'diameter'
  | 'perimeter'
  | 'area'
  | 'volume'
  | 'surface-area'
  | 'angle'
  | 'arc-length';

// 幾何變換
export interface GeometricTransformation {
  type: TransformationType;
  parameters: TransformationParameters;
  description: string;
  matrix?: number[][]; // 變換矩陣
}

// 變換類型
export type TransformationType = 
  | 'translation'  // 平移
  | 'rotation'     // 旋轉
  | 'reflection'   // 反射
  | 'scaling'      // 縮放
  | 'shear';       // 剪切

// 變換參數
export interface TransformationParameters {
  [key: string]: number | Point | string;
}

// 數學練習
export interface MathExercise extends BaseEntity {
  type: MathExerciseType;
  domain: MathDomain;
  concepts: string[]; // 涉及的概念ID
  problem: ProblemStatement;
  solution: SolutionStructure;
  hints: ExerciseHint[];
  difficulty: DifficultyLevel;
  estimatedTime: number; // 分鐘
  prerequisites: string[];
  learningObjectives: string[];
}

// 數學練習類型
export type MathExerciseType = 
  | 'computation'      // 計算題
  | 'word-problem'     // 應用題
  | 'proof'            // 證明題
  | 'construction'     // 作圖題
  | 'analysis'         // 分析題
  | 'multi-step'       // 多步驟問題
  | 'conceptual'       // 概念題
  | 'investigation';   // 探索題

// 問題陳述
export interface ProblemStatement {
  text: string;
  latex?: string;
  context?: string;
  givens: string[];
  toFind: string[];
  diagram?: VisualAid;
  constraints?: string[];
}

// 解答結構
export interface SolutionStructure {
  approach: SolutionApproach;
  steps: SolutionStep[];
  finalAnswer: string;
  verification?: string;
  alternatives?: AlternativeSolution[];
  commonErrors: CommonError[];
}

// 解答方法
export interface SolutionApproach {
  name: string;
  description: string;
  strategy: string;
  keyInsights: string[];
  whenToUse: string;
}

// 解答步驟
export interface SolutionStep {
  stepNumber: number;
  action: string;
  reasoning: string;
  calculation?: string; // LaTeX
  result?: string;
  diagram?: VisualAid;
  checkPoint?: boolean; // 是否為檢查點
}

// 替代解法
export interface AlternativeSolution {
  name: string;
  approach: SolutionApproach;
  steps: SolutionStep[];
  advantages: string[];
  difficulty: DifficultyLevel;
}

// 常見錯誤
export interface CommonError {
  error: string;
  explanation: string;
  correction: string;
  prevention: string;
  frequency: number; // 錯誤頻率 1-10
}

// 練習提示
export interface ExerciseHint {
  level: HintLevel;
  content: string;
  prerequisites?: string[];
  nextStepClue?: string;
}

// 提示等級
export type HintLevel = 
  | 'direction'    // 方向提示
  | 'strategy'     // 策略提示
  | 'step'         // 步驟提示
  | 'calculation'  // 計算提示
  | 'verification'; // 驗證提示

// 數學視覺化
export interface MathVisualization extends BaseEntity {
  type: VisualizationType;
  title: string;
  description: string;
  concepts: string[]; // 相關概念
  interactiveElements: InteractiveElement[];
  staticImages?: string[];
  animationUrl?: string;
  codeUrl?: string; // 生成代碼
}

// 視覺化類型
export type VisualizationType = 
  | 'function-graph'
  | 'geometric-construction'
  | 'statistical-chart'
  | 'probability-simulation'
  | 'algebraic-manipulation'
  | '3d-model'
  | 'dynamic-geometry'
  | 'number-visualization'
  | 'fractal'
  | 'vector-field';

// 互動元素
export interface InteractiveElement {
  id: string;
  type: InteractionType;
  label: string;
  defaultValue: any;
  range?: [number, number];
  options?: string[];
  onChange: string; // 回調函數名
}

// 互動類型
export type InteractionType = 
  | 'slider'
  | 'checkbox'
  | 'dropdown'
  | 'input'
  | 'button'
  | 'drag-point'
  | 'zoom'
  | 'pan';

// 實際應用
export interface RealWorldApplication {
  title: string;
  domain: ApplicationDomain;
  description: string;
  mathConcepts: string[];
  example: ApplicationExample;
  significance: string;
  furtherReading?: string[];
}

// 應用領域
export type ApplicationDomain = 
  | 'physics'
  | 'engineering'
  | 'economics'
  | 'biology'
  | 'computer-science'
  | 'architecture'
  | 'art'
  | 'music'
  | 'sports'
  | 'everyday-life';

// 應用範例
export interface ApplicationExample {
  scenario: string;
  problem: string;
  mathModel: string;
  solution: string;
  interpretation: string;
}

// 數學測驗題擴展
export interface MathQuizQuestion extends BaseQuizQuestion {
  domain: MathDomain;
  gradeLevel: MathGradeLevel;
  concepts: string[]; // 涉及概念
  requiredFormulas?: string[]; // 需要的公式
  calculatorAllowed: boolean;
  workRequired: boolean; // 是否需要顯示計算過程
  partialCreditCriteria?: PartialCreditCriterion[];
}

// 部分分數標準
export interface PartialCreditCriterion {
  step: string;
  points: number;
  requirement: string;
}

// 數學學習統計
export interface MathLearningStats {
  conceptsMastered: number;
  totalProblemsAttempted: number;
  totalProblemsCorrect: number;
  accuracyByDomain: Record<MathDomain, number>;
  timeSpentByDomain: Record<MathDomain, number>;
  difficultyProgression: DifficultyProgressPoint[];
  conceptConnections: number; // 理解的概念連接數
  proofAbility: ProofAbilityLevel;
  visualizationUsage: number;
  streakDays: number;
}

// 難度進步點
export interface DifficultyProgressPoint {
  date: string;
  domain: MathDomain;
  difficulty: DifficultyLevel;
  accuracy: number;
  speed: number; // 問題/分鐘
}

// 證明能力等級
export type ProofAbilityLevel = 
  | 'beginner'      // 初學者
  | 'developing'    // 發展中
  | 'proficient'    // 熟練
  | 'advanced'      // 進階
  | 'expert';       // 專家

// 數學學習偏好
export interface MathLearningPreferences {
  preferredVisualization: boolean;
  stepByStepSolutions: boolean;
  algebraicApproach: boolean;
  geometricIntuition: boolean;
  realWorldApplications: boolean;
  proofOriented: boolean;
  computationFocused: boolean;
  conceptualUnderstanding: boolean;
  collaborativeLearning: boolean;
  gamification: boolean;
}

// 數學互動記錄
export interface MathUserInteraction extends BaseUserInteraction {
  domain: MathDomain;
  exerciseType: MathExerciseType;
  conceptsInvolved: string[];
  calculatorUsed: boolean;
  visualizationViewed: boolean;
  hintsUsed: number;
  solutionSteps?: string[];
}

// 錯誤分析結果
export interface MathErrorAnalysis {
  errorType: MathErrorType;
  frequency: number;
  severity: ErrorSeverity;
  affectedConcepts: string[];
  commonPattern: string;
  remediation: ErrorRemediation;
  examples: ErrorExample[];
}

// 數學錯誤類型
export type MathErrorType = 
  | 'calculation'     // 計算錯誤
  | 'conceptual'      // 概念錯誤
  | 'procedural'      // 程序錯誤
  | 'representation'  // 表示錯誤
  | 'reasoning'       // 推理錯誤
  | 'application'     // 應用錯誤
  | 'notation'        // 記號錯誤
  | 'language';       // 語言理解錯誤

// 錯誤嚴重程度
export type ErrorSeverity = 'minor' | 'moderate' | 'major' | 'critical';

// 錯誤補救
export interface ErrorRemediation {
  strategy: string;
  activities: string[];
  resources: string[];
  expectedTimeframe: string;
  successCriteria: string[];
}

// 錯誤範例
export interface ErrorExample {
  problem: string;
  incorrectSolution: string;
  correctSolution: string;
  explanation: string;
}