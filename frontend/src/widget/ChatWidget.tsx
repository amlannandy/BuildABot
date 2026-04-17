import { useEffect, useRef, useState } from 'react';

import { sendWidgetMessage } from './api';
import type { BuildABotWidgetConfig } from './types';
import { getOrCreateUserIdentifier } from './userIdentifier';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

interface ChatWidgetProps {
  config: BuildABotWidgetConfig;
  onClose: () => void;
}

const themeColor = (config: BuildABotWidgetConfig) => config.themeColor ?? '#228be6';

const styles = {
  panel: {
    position: 'fixed' as const,
    bottom: '80px',
    right: '20px',
    width: '360px',
    height: '520px',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: '14px',
    zIndex: 9998,
  },
  header: (color: string) => ({
    background: color,
    color: '#fff',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontWeight: 600,
    fontSize: '15px',
    flexShrink: 0,
  }),
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '18px',
    lineHeight: 1,
    padding: '0 2px',
    opacity: 0.85,
  },
  messages: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '12px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  bubble: (sender: 'user' | 'bot', color: string) => ({
    maxWidth: '78%',
    padding: '8px 12px',
    borderRadius: sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
    background: sender === 'user' ? color : '#f1f3f5',
    color: sender === 'user' ? '#fff' : '#1a1a1a',
    alignSelf: sender === 'user' ? 'flex-end' : ('flex-start' as const),
    lineHeight: 1.5,
    wordBreak: 'break-word' as const,
  }),
  typingBubble: {
    display: 'flex',
    gap: '4px',
    padding: '10px 14px',
    background: '#f1f3f5',
    borderRadius: '16px 16px 16px 4px',
    alignSelf: 'flex-start' as const,
    width: 'fit-content',
  },
  inputRow: {
    padding: '10px 12px',
    borderTop: '1px solid #e9ecef',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    border: '1px solid #dee2e6',
    borderRadius: '20px',
    padding: '8px 14px',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
  },
  sendBtn: (color: string, disabled: boolean) => ({
    background: disabled ? '#adb5bd' : color,
    border: 'none',
    borderRadius: '50%',
    width: '34px',
    height: '34px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    flexShrink: 0,
    transition: 'background 0.2s',
  }),
};

const TypingDot = ({ delay }: { delay: string }) => (
  <span
    style={{
      width: '7px',
      height: '7px',
      borderRadius: '50%',
      background: '#868e96',
      display: 'inline-block',
      animation: 'buildabot-bounce 1.2s infinite',
      animationDelay: delay,
    }}
  />
);

const KEYFRAMES = `
@keyframes buildabot-bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40% { transform: translateY(-5px); opacity: 1; }
}
`;

let styleInjected = false;
function injectKeyframes() {
  if (styleInjected) return;
  const el = document.createElement('style');
  el.textContent = KEYFRAMES;
  document.head.appendChild(el);
  styleInjected = true;
}

const SendIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#fff"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const ChatWidget: React.FC<ChatWidgetProps> = ({ config, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const color = themeColor(config);

  useEffect(() => {
    injectKeyframes();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), text, sender: 'user' };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      const reply = await sendWidgetMessage(
        config.apiUrl,
        config.chatbotId,
        config.apiKey,
        text,
        getOrCreateUserIdentifier(),
      );
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), text: reply, sender: 'bot' }]);
    } catch (err) {
      const errorText =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), text: errorText, sender: 'bot' }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div style={styles.panel}>
      <div style={styles.header(color)}>
        <span>{config.chatbotName}</span>
        <button style={styles.closeBtn} onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      <div style={styles.messages}>
        {messages.map((msg) => (
          <div key={msg.id} style={styles.bubble(msg.sender, color)}>
            {msg.text}
          </div>
        ))}
        {isSending && (
          <div style={styles.typingBubble}>
            <TypingDot delay="0s" />
            <TypingDot delay="0.2s" />
            <TypingDot delay="0.4s" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputRow}>
        <input
          style={styles.input}
          placeholder="Type a message..."
          value={input}
          disabled={isSending}
          onChange={(e) => {
            setInput(e.target.value);
          }}
          onKeyDown={handleKeyDown}
        />
        <button
          style={styles.sendBtn(color, !input.trim() || isSending)}
          onClick={() => {
            void handleSend();
          }}
          disabled={!input.trim() || isSending}
          aria-label="Send"
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
};

export default ChatWidget;
