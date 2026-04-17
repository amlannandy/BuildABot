import { createRoot } from 'react-dom/client';

import type { BuildABotWidgetConfig } from './types';
import WidgetLauncher from './WidgetLauncher';

function init(config: BuildABotWidgetConfig) {
  const container = document.createElement('div');
  container.id = 'buildabot-widget-root';
  document.body.appendChild(container);
  createRoot(container).render(<WidgetLauncher config={config} />);
}

if (window.BuildABotConfig) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init(window.BuildABotConfig as BuildABotWidgetConfig);
    });
  } else {
    init(window.BuildABotConfig);
  }
}
