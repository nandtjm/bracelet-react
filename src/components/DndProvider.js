import React from 'react';
import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import { HTML5Backend } from 'react-dnd-html5-backend';

const isCoarsePointer = () =>
  typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches;


// Simple Touch backend configuration - works better for Chrome device mode
const CustomDndProvider = ({ children }) => {
  const useTouch = isCoarsePointer();
  const backend = useMemo(() => (useTouch ? TouchBackend : HTML5Backend), [useTouch]);
  const options = useMemo(
    () =>
      useTouch
        ? {
            enableMouseEvents: true,
            ignoreContextMenu: true,
            enableHoverOutsideTarget: false,
            enableKeyboardEvents: true,
            delay: 100,
            delayTouchStart: 100,
            touchSlop: 10,
          }
        : undefined,
    [useTouch]
  );

  return (
    <DndProvider backend={backend} options={options}>
      {children}
    </DndProvider>
  );
};

export default CustomDndProvider;