export type AIProviderType = 'local' | 'gemini' | 'openai' | 'replicate' | 'custom';

export interface AIProviderConfig {
  activeProvider: AIProviderType;
  geminiApiKey?: string;
  geminiModel?: string;
  openaiApiKey?: string;
  openaiModel?: string;
  replicateApiKey?: string;
  customEndpoint?: string;
  customApiKey?: string;
  customModel?: string;
}

export interface ClientSafeConfig {
  activeProvider: AIProviderType;
  hasGeminiKey: boolean;
  geminiModel: string;
  hasOpenaiKey: boolean;
  openaiModel: string;
  hasReplicateKey: boolean;
  hasCustomKey: boolean;
  customEndpoint: string;
  customModel: string;
  maskedKeys: {
    gemini?: string;
    openai?: string;
    replicate?: string;
    custom?: string;
  };
}

export interface StyleProfile {
  id: string;
  name: string;
  theme: string;
  aesthetic: string;
  palette: Array<{ hex: string; percentage: number }>;
  dominantGlowColor: string;
  glowIntensity: number;
  shadowIntensity: number;
  metallicBoost: number;
  neonBoost: number;
  edgeFeather: number;
  referenceImageUrl?: string;
  createdAt: string;
}

export interface AnalysisResult {
  theme: string;
  aesthetic: string;
  palette: Array<{ hex: string; percentage: number }>;
  dominantGlowColor: string;
  metrics: {
    brightness: number;
    contrast: number;
    saturation: number;
    edge_density: number;
  };
  suggested_settings: {
    glow_intensity: number;
    glow_color: string;
    shadow_intensity: number;
    metallic_boost: number;
    neon_boost: number;
    edge_feather: number;
  };
  layout_elements?: Array<{
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    area_pct: number;
  }>;
  ai_notes?: string;
}

export interface OverlayProcessingOptions {
  glowIntensity: number;
  glowColor: string;
  shadowIntensity: number;
  neonBoost: number;
  metallicBoost: number;
  edgeFeather: number;
  resolution: 'original' | '1080p' | '1440p' | '4k';
  hollowCenter: boolean;
  backgroundColor?: 'ocean' | 'transparent' | 'black' | string;
  styleProfileId?: string;
}

export interface QualityReport {
  success: boolean;
  dimensions: { width: number; height: number };
  transparency_percentage: number;
  palette: string[];
  quality_score: number;
  warnings: string[];
  effects_applied: {
    glow: boolean;
    glow_color: string;
    glow_intensity: number;
    shadow: boolean;
    shadow_intensity: number;
    neon_boost: number;
    metallic_boost: number;
  };
}

export interface HistoryItem {
  id: string;
  title: string;
  theme: string;
  originalUrl: string;
  outputUrl: string;
  dimensions: { width: number; height: number };
  transparencyPercentage: number;
  qualityScore: number;
  palette: string[];
  createdAt: string;
  options: OverlayProcessingOptions;
}

