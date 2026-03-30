export interface ChapterMeta {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  duration: string;
  badgeName: string;
  badgeIcon: string;
  particleColor: string;
  steps: StepMeta[];
}

export interface StepMeta {
  id: number;
  slug: string;
  title: string;
}

export interface AgentConfig {
  name: string;
  voice: string;
  voiceProvider: string;
  language: string;
  persona: string;
  features: string[];
}

export interface Progress {
  completedSteps: string[]; // "chapter-1:step-2"
  currentChapter: number;
  currentStep: number;
  agentConfig: AgentConfig;
  badges: string[];
  callCount: number;
}

export const DEFAULT_AGENT_CONFIG: AgentConfig = {
  name: "",
  voice: "",
  voiceProvider: "",
  language: "en-US",
  persona: "",
  features: [],
};

export const DEFAULT_PROGRESS: Progress = {
  completedSteps: [],
  currentChapter: 1,
  currentStep: 1,
  agentConfig: DEFAULT_AGENT_CONFIG,
  badges: [],
  callCount: 0,
};
