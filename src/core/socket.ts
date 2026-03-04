let socket: WebSocket | null = null;
let reconnectTimer: any = null;

const WS_URL = "ws://localhost:3000/ws";

// เชื่อมต่อ websocket
export function connectSocket() {

  if (socket && socket.readyState === WebSocket.OPEN) {
    return;
  }

  console.log("🔌 Connecting WebSocket...");

  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log("✅ WebSocket connected");
  };

  socket.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);

      console.log("📥 Message from backend:", msg);

      switch (msg.type) {

        case "route_update":
          console.log("🗺 Route update:", msg.path);
          break;

        case "guest_move":
          console.log("👤 Guest moved:", msg);
          break;

        case "arrival":
          console.log("🎯 Arrived at destination");
          break;

        default:
          console.log("📦 Unknown message:", msg);
      }

    } catch (err) {
      console.log("📥 Raw message:", event.data);
    }
  };

  socket.onclose = () => {
    console.log("❌ WebSocket disconnected");

    // 🔄 reconnect หลัง 3 วิ
    reconnectTimer = setTimeout(() => {
      console.log("🔄 Reconnecting WebSocket...");
      connectSocket();
    }, 3000);
  };

  socket.onerror = (err) => {
    console.error("⚠️ WebSocket error:", err);
  };
}


// ส่งตำแหน่งไป backend
export function sendPosition(payload: any) {

  console.log("📡 Sending to backend:", payload);

  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn("⚠️ WebSocket not connected");
    return;
  }

  socket.send(
    JSON.stringify({
      type: "position_update",
      payload: payload
    })
  );
}