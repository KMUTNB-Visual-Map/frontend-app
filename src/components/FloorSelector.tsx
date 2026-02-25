import React from 'react';
import { useNavStore } from '../store/useNavStore';

export default function FloorSelector() {
  const { 
    currentFloor, 
    setFloor, 
    guestId, 
    userPosition, 
    targetLocation 
  } = useNavStore();
  
  const floors = [6, 5, 4, 3, 2, 1];

  return (
    <div className="flex flex-col gap-3 pointer-events-auto">
      {floors.map((f) => {
        const isActive = currentFloor === f;
        return (
          <button 
            key={f} 
            onClick={() => {
              console.log("floor", f);
              console.log("id", guestId);
              console.log("current_pos", userPosition);
              // ถ้า targetLocation มีค่า ให้โชว์พิกัด ถ้าไม่มีโชว์ null
              console.log("target_pos", targetLocation?.pos || targetLocation);
              
              setFloor(f);
            }}
            className={`w-14 h-14 rounded-2xl shadow-xl font-black transition-all flex items-center justify-center border-2 ${
              isActive 
                ? '!bg-blue-600 text-white border-blue-400 scale-110 shadow-blue-500/50' 
                : 'bg-white text-slate-800 border-transparent hover:bg-slate-100'
            }`}
          >
            <span className="text-2xl relative z-10">{f}</span>
          </button>
        );
      })}
    </div>
  );
}