import React from 'react';
import { useDrop } from 'react-dnd';

const CharmDropzone = ({
  dropzoneIndex,
  onDrop,
  onDragOver,
  isOccupied = false,
  style = {},
  className = '',
  children
}) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'CHARM',
    drop: (item, monitor) => {
      if (!monitor.didDrop()) {
        // Create fake event for compatibility with existing handleDrop
        const fakeDropEvent = {
          preventDefault: () => {},
          stopPropagation: () => {},
          dataTransfer: {
            getData: () => JSON.stringify({
              item: item.charm,
              itemType: item.itemType
            })
          }
        };
        
        if (onDrop) {
          onDrop(fakeDropEvent, dropzoneIndex);
        }
      }
    },
    hover: (item, monitor) => {
      if (onDragOver) {
        const fakeEvent = {
          preventDefault: () => {},
          stopPropagation: () => {}
        };
        onDragOver(fakeEvent);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop() && !isOccupied,
    }),
    canDrop: () => !isOccupied
  }), [dropzoneIndex, isOccupied, onDrop, onDragOver]);

  return (
    <div
      ref={drop}
      className={`bc-dropzone ${!isOccupied ? 'bc-dropzone-full' : ''} ${className}`}
      style={{
        ...style,
        background: !isOccupied && isOver && canDrop ? 'rgba(218, 159, 196, 0.8)' : (isOccupied ? 'transparent' : undefined),
        boxShadow: !isOccupied && isOver && canDrop ? '0 0 15px 6px #da9fc4aa' : (isOccupied ? 'none' : undefined),
        border: isOccupied ? 'none' : undefined,
        transform: !isOccupied && isOver && canDrop ? 'scale(1.2)' : 'scale(1)',
        transition: 'all 0.2s ease',
        zIndex: isOver && canDrop ? 20 : 5
      }}
    >
      {children}
    </div>
  );
};

export default CharmDropzone;