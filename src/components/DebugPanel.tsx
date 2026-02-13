import { useNavStore } from '../store/useNavStore';

export const DebugPanel = () => {
  const { updatePos, setPath } = useNavStore();
  return (
    <div style={{ position: 'fixed', top: 20, left: 20, background: '#f0f0f0', padding: 20, zIndex: 1000, color: 'black', border: '2px solid #333' }}>
      <h3>🛠 Lead's Debug Panel</h3>
      <button onClick={() => setPath([{ x: 0, y: 0, z: 0 }, { x: 10, y: 0, z: 10 }])}>
        1. Simulate Backend Path
      </button>
      <br /><br />
      <button onClick={() => updatePos({ x: Math.random() * 10, y: 0, z: Math.random() * 10 })}>
        2. Move User (Random)
      </button>
    </div>
  );
};