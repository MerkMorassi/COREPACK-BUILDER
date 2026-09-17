import { create } from 'zustand';
import { CorepackConfig } from './types';
import { DEFAULT_COREPACK, PRESET_COREPACKS } from './data/presets';

interface AppState {
  activeTab: string;
  isStandaloneAuthpack: boolean;
  presets: Record<string, CorepackConfig>;
  config: CorepackConfig;
  
  setActiveTab: (tab: string) => void;
  setIsStandaloneAuthpack: (val: boolean) => void;
  setPresets: (presets: Record<string, CorepackConfig>) => void;
  setConfig: (config: CorepackConfig) => void;
  resetToDefault: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'dashboard',
  isStandaloneAuthpack: false,
  presets: PRESET_COREPACKS,
  config: DEFAULT_COREPACK,

  setActiveTab: (activeTab) => set({ activeTab }),
  setIsStandaloneAuthpack: (isStandaloneAuthpack) => set({ isStandaloneAuthpack }),
  setPresets: (presets) => set({ presets }),
  setConfig: (config) => set({ config }),
  resetToDefault: () => set({ config: JSON.parse(JSON.stringify(DEFAULT_COREPACK)) }),
}));
