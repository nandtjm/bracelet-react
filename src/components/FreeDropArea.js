import React from 'react';
import { useDrop } from 'react-dnd';

const FreeDropArea = ({
  onDrop,
  onDragOver,
  children,
  style = {},
  className = ''
}) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'CHARM',
    drop: (item, monitor) => {
      if (!monitor.didDrop()) {
        // Get the drop position relative to the drop area
        const dropArea = drop.current;
        if (!dropArea) return;

        const dropAreaRect = dropArea.getBoundingClientRect();
        const clientOffset = monitor.getClientOffset();
        
        if (clientOffset && dropAreaRect) {
          // Calculate position as percentage of drop area dimensions
          const x = ((clientOffset.x - dropAreaRect.left) / dropAreaRect.width) * 100;
          const y = ((clientOffset.y - dropAreaRect.top) / dropAreaRect.height) * 100;
          
          // Clamp values to stay within bounds with some margin
          const clampedX = Math.min(Math.max(x, 10), 90);
          const clampedY = Math.min(Math.max(y, 10), 90);
          
          // Create fake event for compatibility with existing handleDrop
          const fakeDropEvent = {
            preventDefault: () => {},
            stopPropagation: () => {},
            dataTransfer: {
              getData: () => JSON.stringify({
                item: item.charm,
                itemType: item.itemType
              })
            },
            position: {
              x: clampedX,
              y: clampedY
            }
          };
          
          if (onDrop) {
            onDrop(fakeDropEvent, null); // null dropzoneIndex for free placement
          }
        }
        
        return { position: 'free' };
      }
    },
    hover: (_, monitor) => {
      const isTouch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
      const isOverTarget = isTouch ? monitor.isOver() : monitor.isOver({ shallow: true });
      
      if (onDragOver && isOverTarget) {
        const fakeEvent = {
          preventDefault: () => {},
          stopPropagation: () => {}
        };
        onDragOver(fakeEvent);
      }
    },
    collect: (monitor) => {
      const isTouch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
      const isOverTarget = isTouch ? monitor.isOver() : monitor.isOver({ shallow: true });
      
      return {
        isOver: isOverTarget,
        canDrop: monitor.canDrop(),
      };
    },
  }), [onDrop, onDragOver]);

  return (
    <div
      ref={drop}
      className={`bc-free-drop-area ${className}`}
      style={{
        ...style,
        background: isOver && canDrop ? 'rgba(218, 159, 196, 0.1)' : 'transparent',
        transition: 'background-color 0.2s ease',
        cursor: isOver && canDrop ? 'copy' : 'default'
      }}
    >
      {children}
    </div>
  );
};

export default FreeDropArea;