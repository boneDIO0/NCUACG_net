import './ChatBubble.css';

export default function ChatBubble(props: { role: 'user' | 'assistant'; text: string }) {
  const { role, text } = props;
  return (
    <div className={`bubble ${role}`}>
      <p>{text}</p>
    </div>
  );
}