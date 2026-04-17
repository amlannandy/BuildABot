import { useState } from 'react';

import ChatWidget from './ChatWidget';
import type { BuildABotWidgetConfig } from './types';

interface WidgetLauncherProps {
  config: BuildABotWidgetConfig;
}

const color = (config: BuildABotWidgetConfig) => config.themeColor ?? '#228be6';

const ChatBubbleIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#fff"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#fff"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const WidgetLauncher: React.FC<WidgetLauncherProps> = ({ config }) => {
  const [isOpen, setIsOpen] = useState(false);

  const btnStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: color(config),
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
    zIndex: 9999,
    transition: 'transform 0.15s, box-shadow 0.15s',
  };

  return (
    <>
      {isOpen && (
        <ChatWidget
          config={config}
          onClose={() => {
            setIsOpen(false);
          }}
        />
      )}
      <button
        style={btnStyle}
        onClick={() => {
          setIsOpen((o) => !o);
        }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.28)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.22)';
        }}
      >
        {isOpen ? <CloseIcon /> : <ChatBubbleIcon />}
      </button>
    </>
  );
};

export default WidgetLauncher;
