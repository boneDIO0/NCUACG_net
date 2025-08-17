// frontend/src/components/PersonaSwitch.tsx
import { useMemo } from 'react';
import { useChatContext } from '../contexts/ChatContext';
import personasJson from '../data/personas.json';

type Persona = {
  id: string;
  name?: string;
  displayName?: string;
  description?: string;
  avatar?: string;
};

type Props = {
  showLabel?: boolean; // 是否顯示「角色：」標籤
};

export default function PersonaSwitch({ showLabel = true }: Props) {
  const { personaId, setPersonaId } = useChatContext();

  // 整理成 {id, name} 清單；name 以 displayName 優先
  const personas = useMemo(
    () =>
      ((personasJson as Persona[]) ?? []).map((p) => ({
        id: p.id,
        name: p.displayName || p.name || p.id,
        description: p.description ?? '',
      })),
    []
  );

  // 當前值：若 context 尚未設定，用第一個當預設
  const currentId = personaId || personas[0]?.id || '';

  return (
    <div className="persona-switch" role="group" aria-label="AI 角色切換">
      {showLabel && (
        <label htmlFor="persona-select" className="persona-switch__label">
          角色：
        </label>
      )}

      <select
        id="persona-select"
        className="persona-switch__select"
        value={currentId}
        onChange={(e) => setPersonaId(e.target.value)}
        aria-label="選擇 AI 助理角色"
      >
        {personas.map((p) => (
          <option key={p.id} value={p.id} title={p.description}>
            {p.name}
          </option>
        ))}
      </select>

      {/* 超薄樣式；若有全域設計系統可移除 */}
      <style>{`
        .persona-switch { display: inline-flex; align-items: center; gap: .5rem; }
        .persona-switch__label { font-size: .9rem; color: #444; }
        .persona-switch__select {
          padding: .4rem .6rem;
          border-radius: .5rem;
          border: 1px solid #cfd4dc;
          background: #fff;
          font-size: .95rem;
          min-width: 180px;
        }
        .persona-switch__select:focus {
          outline: none;
          border-color: #5b8cff;
          box-shadow: 0 0 0 3px rgba(91,140,255,.18);
        }
        @media (max-width: 640px) {
          .persona-switch { width: 100%; }
          .persona-switch__select { width: 100%; }
        }
      `}</style>
    </div>
  );
}
