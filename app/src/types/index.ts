export type Role = 'editor' | 'operator' | 'general';

export interface AppContextType {
  serverIP: string | null;
  locale: 'en' | 'uk';
  role: Role;
  setServerIP: (ip: string | null) => void;
  setLocale: (locale: 'en' | 'uk') => void;
  setRole: (role: Role) => void;
}

// WebSocket Broadcast States from Server
export type BroadcastState =
  | 'QUESTION_PRE'
  | 'QUESTION_OPEN'
  | 'QUESTION_CLOSED'
  | 'QUESTION_COMPLETE'
  | 'IDLE'
  | 'BUYOUT_OPEN'
  | 'BUYOUT_COMPLETE'
  | 'UPDATE_PLAYERS';

// Payload for most WebSocket events
export interface iQuizSate {
  // As received from WebSocket
  showNumber: Date;
  tierNumber: number; // Used to identify the current tier (matches TierDataType.idx)
  tierLegend: string; // Displayed in Prepare Screen, used for buyout check
  enableCountdown: boolean;
  passOneAllowed: boolean;
  passTwoAllowed: boolean;
  questionLabel: string;
  questionImage: string;
  correctAnswer: string;
  questionText: string;
  state: BroadcastState;
  maxPrize: number;
  prizeChange: number;
  prizePool: number;
  boughtOut: number;
  remainingPlayers: number;
  eliminatedPlayers: number;
  correctAnswers: number;
  incorrectAnswers: number;
  passes: number;
  ready: number;
  countdownDuration: number;
  timerStatus: TimerStatus; // New field for timer status
}
export interface TimerStatus {
  remainingTime: number | null;
  initialDuration: number | null;
  status: 'idle' | 'running' | 'stopped' | 'reset' | 'complete' | 'error';
  tierId: string | null;
}

export interface iAnswerState {
  showNumber: Date;
  tierNumber: number;
  tierLegend: string;
  questionLabel: string;
  correctAnswer: string;
  seat: number;
  name: string;
  playerId: number | null;
  answer: string;
  isCorrect: boolean | null;
  usedPassOne: boolean;
  usedPassTwo: boolean;
  boughtOut: boolean;
  auto: boolean;
  timestamp: Date | null;
  pass: boolean;
}

export type PlayerType = 'active' | 'passed' | 'editor' | undefined;

// Player Data (part of SeatDataType)
export type PlayerDataType = {
  id: number;
  name: string;
  rank: string | null;
  occupation: string | null;
  notes: string | null;
  goal: string | null;
  relations: string[] | null;
  isActive: boolean;
  usedPassOne: boolean;
  usedPassTwo: boolean;
  boughtOut: boolean;
  boughtOutEndGame: boolean;
  externalId: string;
  image: string; // Player's avatar/image filename
  isAnswerCorrect?: boolean | null;
  isAnswerPass?: boolean | null;
  isAnswerBoughtOut?: boolean | null;
  isPlayerReady?: boolean | null;
};

// Seat Data (from GET /seats/[seat])
export type SeatDataType = {
  id: string;
  seat: number;
  editorIndex: number;
  description: string;
  sector: string;
  cameras: string;
  player?: PlayerDataType | null;
};

// Question Type Enum
export type QuestionTypeEnum = 'MULTIPLE' | 'TEXT' | 'TEXT NUMERIC' | '';

// Question Data (nested in TierDataType from GET /tiers)
export type QuestionDataType = {
  id: string;
  label: string;
  image: string; // Filename of the question image
  questionType: QuestionTypeEnum;
  answerOptions: string; // Semicolon-delimited string, e.g., "A;B;C;D"
  correctAnswer: string;
  description: string | null;
};

// Tier Data (as received from GET /tiers)
export type TierDataType = {
  id: string;
  idx: number; // Matches iQuizSate.tierNumber
  legend: string;
  passOneAllowed: boolean;
  passTwoAllowed: boolean;
  enableCountdown: boolean;
  boundQuestion: string; // ID of the bound question
  question?: QuestionDataType | null; // Contains detailed question info
};

// App's Internal Tier State (derived from TierDataType and iQuizSate)
export type AppTierType = {
  tierNumber: number; // From iQuizSate.tierNumber
  legend: string; // From TierDataType.legend (or iQuizSate.tierLegend)
  passOneAllowed: boolean; // From TierDataType
  passTwoAllowed: boolean; // From TierDataType
  enableCountdown: boolean; // From TierDataType
  label: string; // From TierDataType.question.label
  image: string; // From TierDataType.question.image
  questionType: QuestionTypeEnum; // From TierDataType.question.questionType
  answerOptions: string; // From TierDataType.question.answerOptions
};

// Outgoing WebSocket Message Types
export interface iCheckMessage {
  seat: number;
  imageLoaded: boolean;
  tierNumber: number;
  questionNumber?: number; // Made optional
}

export interface iAnswerMessage {
  seat: number;
  answer?: string;
  pass?: boolean;
  boughtOut?: boolean;
  auto: boolean;
}

