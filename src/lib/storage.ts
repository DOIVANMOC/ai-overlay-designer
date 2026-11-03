import fs from 'fs';
import path from 'path';
import { AIProviderConfig, ClientSafeConfig, StyleProfile, HistoryItem } from './types';

const STORAGE_DIR = path.join(process.cwd(), 'storage');
const CONFIG_FILE = path.join(STORAGE_DIR, 'server_config.json');
const STYLES_FILE = path.join(STORAGE_DIR, 'styles.json');
const HISTORY_FILE = path.join(STORAGE_DIR, 'history.json');

function ensureDirectoryExists(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function maskApiKey(key?: string): string {
  if (!key || key.trim().length === 0) return '';
  if (key.length <= 8) return '••••••••';
  return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
}

export function getServerConfig(): AIProviderConfig {
  ensureDirectoryExists(STORAGE_DIR);
  if (!fs.existsSync(CONFIG_FILE)) {
    const defaultConfig: AIProviderConfig = {
      activeProvider: 'local',
      geminiModel: 'gemini-1.5-flash',
      openaiModel: 'gpt-4o',
      customEndpoint: '',
      customModel: 'gpt-4o'
    };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2), 'utf-8');
    return defaultConfig;
  }

  try {
    const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(data) as AIProviderConfig;
  } catch (error) {
    console.error('Failed to read server config:', error);
    return {
      activeProvider: 'local',
      geminiModel: 'gemini-1.5-flash',
      openaiModel: 'gpt-4o',
      customEndpoint: '',
      customModel: 'gpt-4o'
    };
  }
}

export function saveServerConfig(newConfig: Partial<AIProviderConfig>): AIProviderConfig {
  ensureDirectoryExists(STORAGE_DIR);
  const current = getServerConfig();
  const merged: AIProviderConfig = {
    ...current,
    ...newConfig
  };

  // If apiKey was left empty or as masked string, keep current
  if (newConfig.geminiApiKey && newConfig.geminiApiKey.includes('••••')) {
    merged.geminiApiKey = current.geminiApiKey;
  }
  if (newConfig.openaiApiKey && newConfig.openaiApiKey.includes('••••')) {
    merged.openaiApiKey = current.openaiApiKey;
  }
  if (newConfig.replicateApiKey && newConfig.replicateApiKey.includes('••••')) {
    merged.replicateApiKey = current.replicateApiKey;
  }
  if (newConfig.customApiKey && newConfig.customApiKey.includes('••••')) {
    merged.customApiKey = current.customApiKey;
  }

  fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), 'utf-8');
  return merged;
}

export function getClientSafeConfig(): ClientSafeConfig {
  const config = getServerConfig();
  return {
    activeProvider: config.activeProvider || 'local',
    hasGeminiKey: Boolean(config.geminiApiKey && config.geminiApiKey.trim().length > 0),
    geminiModel: config.geminiModel || 'gemini-1.5-flash',
    hasOpenaiKey: Boolean(config.openaiApiKey && config.openaiApiKey.trim().length > 0),
    openaiModel: config.openaiModel || 'gpt-4o',
    hasReplicateKey: Boolean(config.replicateApiKey && config.replicateApiKey.trim().length > 0),
    hasCustomKey: Boolean(config.customApiKey && config.customApiKey.trim().length > 0),
    customEndpoint: config.customEndpoint || '',
    customModel: config.customModel || 'gpt-4o',
    maskedKeys: {
      gemini: maskApiKey(config.geminiApiKey),
      openai: maskApiKey(config.openaiApiKey),
      replicate: maskApiKey(config.replicateApiKey),
      custom: maskApiKey(config.customApiKey)
    }
  };
}

export function getStyleProfiles(): StyleProfile[] {
  ensureDirectoryExists(STORAGE_DIR);
  if (!fs.existsSync(STYLES_FILE)) {
    // Default preset style profiles to help user immediately
    const defaults: StyleProfile[] = [
      {
        id: 'cyberpunk-neon',
        name: 'Cyberpunk Neon HUD',
        theme: 'Cyberpunk / Neon Futuristic',
        aesthetic: 'High-tech luminescent cyan/magenta borders, sharp geometric cuts, neon glow falloff',
        palette: [
          { hex: '#00e5ff', percentage: 40 },
          { hex: '#ff007f', percentage: 30 },
          { hex: '#0a0a14', percentage: 30 }
        ],
        dominantGlowColor: '#00e5ff',
        glowIntensity: 55,
        shadowIntensity: 40,
        metallicBoost: 20,
        neonBoost: 35,
        edgeFeather: 2,
        createdAt: new Date().toISOString()
      },
      {
        id: 'mecha-gold',
        name: 'Mecha Gold Luxury Armor',
        theme: 'Mecha Gold / Luxury Armor',
        aesthetic: 'Chiseled golden metallic bevels, luxury armor plating, warm ambient illumination',
        palette: [
          { hex: '#ffd700', percentage: 45 },
          { hex: '#deab50', percentage: 30 },
          { hex: '#1a140a', percentage: 25 }
        ],
        dominantGlowColor: '#ffd700',
        glowIntensity: 45,
        shadowIntensity: 50,
        metallicBoost: 40,
        neonBoost: 15,
        edgeFeather: 2,
        createdAt: new Date().toISOString()
      },
      {
        id: 'minimalist-esports',
        name: 'Minimalist Esports Stealth',
        theme: 'Dark Minimalist / Stealth Tech',
        aesthetic: 'Subtle carbon fiber textures, discreet wireframe borders, clean functional hierarchy',
        palette: [
          { hex: '#18181b', percentage: 50 },
          { hex: '#27272a', percentage: 30 },
          { hex: '#ffffff', percentage: 20 }
        ],
        dominantGlowColor: '#a1a1aa',
        glowIntensity: 20,
        shadowIntensity: 50,
        metallicBoost: 15,
        neonBoost: 5,
        edgeFeather: 1,
        createdAt: new Date().toISOString()
      }
    ];
    fs.writeFileSync(STYLES_FILE, JSON.stringify(defaults, null, 2), 'utf-8');
    return defaults;
  }

  try {
    const data = fs.readFileSync(STYLES_FILE, 'utf-8');
    return JSON.parse(data) as StyleProfile[];
  } catch (error) {
    console.error('Failed to read style profiles:', error);
    return [];
  }
}

export function saveStyleProfile(profile: StyleProfile): StyleProfile[] {
  ensureDirectoryExists(STORAGE_DIR);
  const profiles = getStyleProfiles();
  const existingIdx = profiles.findIndex(p => p.id === profile.id);
  if (existingIdx >= 0) {
    profiles[existingIdx] = profile;
  } else {
    profiles.unshift(profile);
  }
  fs.writeFileSync(STYLES_FILE, JSON.stringify(profiles, null, 2), 'utf-8');
  return profiles;
}

export function deleteStyleProfile(id: string): StyleProfile[] {
  ensureDirectoryExists(STORAGE_DIR);
  const profiles = getStyleProfiles().filter(p => p.id !== id);
  fs.writeFileSync(STYLES_FILE, JSON.stringify(profiles, null, 2), 'utf-8');
  return profiles;
}

export function getHistory(): HistoryItem[] {
  ensureDirectoryExists(STORAGE_DIR);
  if (!fs.existsSync(HISTORY_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
    return JSON.parse(data) as HistoryItem[];
  } catch (error) {
    console.error('Failed to read history:', error);
    return [];
  }
}

export function addHistoryItem(item: HistoryItem): HistoryItem[] {
  ensureDirectoryExists(STORAGE_DIR);
  const history = getHistory();
  history.unshift(item);
  // Keep up to 50 items
  const trimmed = history.slice(0, 50);
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(trimmed, null, 2), 'utf-8');
  return trimmed;
}

export function deleteHistoryItem(id: string): HistoryItem[] {
  ensureDirectoryExists(STORAGE_DIR);
  const history = getHistory().filter(item => item.id !== id);
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
  return history;
}

