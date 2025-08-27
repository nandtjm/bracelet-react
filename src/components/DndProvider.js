import React from 'react';
import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';

// Simple Touch backend configuration - works better for Chrome device mode
const CustomDndProvider = ({ children }) => {
  return (
    <DndProvider 
      backend={TouchBackend} 
      options={{
        enableMouseEvents: true,
        ignoreContextMenu: true,
        enableHoverOutsideTarget: false,
        enableKeyboardEvents: true,
        delay: 100,
        delayTouchStart: 100,
        touchSlop: 10
      }}
    >
      {children}
    </DndProvider>
  );
};

export default CustomDndProvider;