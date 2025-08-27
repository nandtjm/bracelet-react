import React, { useEffect } from 'react';
import { useDrag } from 'react-dnd';

const DraggableCharm = ({
  charm,
  isFromGrid = true,
  currentDropzoneIndex = null,
  onDragStart,
  onDragEnd,
  children,
  style = {},
  className = '',
  disabled = false
}) => {
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'CHARM',
    item: () => {
      const dragData = {
        charm,
        itemType: isFromGrid ? 'charm' : 'placed-charm',
        currentDropzoneIndex
      };
      
      if (onDragStart) {
        // Create a fake event object for compatibility
        const fakeEvent = {
          preventDefault: () => {},
          stopPropagation: () => {}
        };
        onDragStart(fakeEvent, charm, dragData.itemType);
      }
      
      return dragData;
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (onDragEnd) {
        const fakeEvent = {
          preventDefault: () => {},
          stopPropagation: () => {}
        };
        onDragEnd(fakeEvent);
      }
    },
    canDrag: !disabled
  }), [charm, isFromGrid, currentDropzoneIndex, disabled]);

  // Set up custom drag preview
  useEffect(() => {
    // Create a custom drag image
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Handle CORS issues
    img.onload = () => {
      // Set preview with the loaded image
      preview(img, {
        captureDraggingState: true,
        offsetX: 0,
        offsetY: 0
      });
    };
    img.onerror = () => {
      // If image fails to load, create a fallback preview
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 80;
      canvas.height = 80;
      
      // Draw a simple placeholder
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, 80, 80);
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(charm.name || 'Charm', 40, 40);
      
      preview(canvas, { captureDraggingState: true });
    };
    img.src = charm.image;
  }, [charm.image, charm.name, preview]);

  return (
    <>
      
      <div
        ref={drag}
        className={className}
        style={{
          ...style,
          opacity: isDragging ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : (isDragging ? 'grabbing' : 'grab'),
          userSelect: 'none',
          WebkitUserSelect: 'none'
        }}
      >
        {children}
      </div>
    </>
  );
};

export default DraggableCharm;