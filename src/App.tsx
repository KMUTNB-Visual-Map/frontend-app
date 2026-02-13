import { DebugPanel } from './components/DebugPanel';
import { useNavStore } from './store/useNavStore';

function App() {
  const { userPos, targetPath } = useNavStore();

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#222', color: 'white', padding: '50px' }}>
      <h1>KMUTNB Navigation Project</h1>
      <p>Frontend Lead Dashboard</p>
      
      <div style={{ marginTop: '100px', border: '1px solid #555', padding: '20px' }}>
        <h3>Live Data Monitor (State)</h3>
        <p>Current User Pos: X: {userPos.x.toFixed(2)}, Z: {userPos.z.toFixed(2)}</p>
        <p>Path Nodes in System: {targetPath.length} nodes</p>
      </div>

      {/* เรียกใช้ปุ่มทดสอบที่เราสร้างไว้ */}
      <DebugPanel />
    </div>
  );
}

export default App;