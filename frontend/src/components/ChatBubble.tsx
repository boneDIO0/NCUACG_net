import './ChatBubble.css';

type BubbleRole = 'assistant' | 'user' | 'system';

interface Props {
  role: BubbleRole;
  text: string;
}

export default function ChatBubble({ role, text }: Props) {
  return (
    <div className={`bubble ${role}`}>
      <p>{text}</p>
    </div>
  );
}
