export interface ElectronUpdateResult {
  success: boolean;
  updateAvailable?: boolean;
  currentVersion?: string;
  latestVersion?: string;
  downloadUrl?: string;
  error?: string;
}

export interface ElectronUpdatePayload {
  currentVersion: string;
  latestVersion: string;
  downloadUrl: string;
  releaseNotes: string;
  mandatory: boolean;
}

declare global {
  interface Window {
    electronAPI?: {
      retry: () => void;
      isDesktop?: boolean;
      platform?: string;
      getAppVersion?: () => Promise<string>;
      checkForUpdates?: () => Promise<ElectronUpdateResult>;
      onUpdateAvailable?: (
        callback: (data: ElectronUpdatePayload) => void
      ) => () => void;
    };
  }
}
