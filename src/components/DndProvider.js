import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { MultiBackend } from 'react-dnd-multi-backend';

// Multi-backend configuration for React DnD
// Automatically switches between HTML5 (desktop) and Touch (mobile/tablet)
const HTML5toTouch = {
  backends: [
    {
      id: 'html5',
      backend: HTML5Backend,
      transition: {
        type: 'pointer',
        values: ['mouse']
      }
    },
    {
      id: 'touch',
      backend: TouchBackend,
      options: {
        enableMouseEvents: true,
        ignoreContextMenu: true,
        enableHoverOutsideTarget: false,
        enableKeyboardEvents: true,
        delay: 200,
        delayTouchStart: 200,
        touchSlop: 5
      },
      preview: true,
      transition: {
        type: 'pointer',
        values: ['touch', 'pen']
      }
    }
  ]
};

const CustomDndProvider = ({ children }) => {
  return (
    <DndProvider backend={MultiBackend} options={HTML5toTouch}>
      {children}
    </DndProvider>
  );
};

export default CustomDndProvider;