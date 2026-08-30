export interface SimilaritySettings {
  candidateThreshold: number;
  autoMergeThreshold: number;
}

export interface RiskSettings {
  criticalThreshold: number;
  highThreshold: number;
  mediumThreshold: number;
  immediateReviewThreshold: number;
}

export interface AiSettings {
  enableAiExplanations: boolean;
  aiModel: string;
  temperature: number;
}

export interface NotificationSettings {
  enableEmailNotifications: boolean;
  enableSlackNotifications: boolean;
  notifyOnCriticalRisk: boolean;
  notifyOnHighRisk: boolean;
  notificationEmail: string | null;
}

export interface SystemSettings {
  similarity: SimilaritySettings;
  risk: RiskSettings;
  ai: AiSettings;
  notification: NotificationSettings;
  updatedAt: string | null;
}

export interface UpdateSystemSettings {
  similarity?: SimilaritySettings;
  risk?: RiskSettings;
  ai?: AiSettings;
  notification?: NotificationSettings;
}
