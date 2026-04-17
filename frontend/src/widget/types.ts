export interface BuildABotWidgetConfig {
  chatbotId: number;
  apiUrl: string;
  chatbotName: string;
  apiKey: string;
  themeColor?: string;
}

declare global {
  interface Window {
    BuildABotConfig?: BuildABotWidgetConfig;
  }
}
