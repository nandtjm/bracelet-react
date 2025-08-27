import React, { useEffect, useState } from 'react';
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
  const [dragPreview, setDragPreview] = useState(null);
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
      
      // Create drag preview element
      createDragPreview();
      
      return dragData;
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      // Remove drag preview
      removeDragPreview();
      
      if (onDragEnd) {
        const fakeEvent = {
          preventDefault: () => {},
          stopPropagation: () => {}
        };
        onDragEnd(fakeEvent);
      }
    },
    canDrag: !disabled
  }), [charm, isFromGrid, currentDropzoneIndex, disabled, dragPreview]);

  // Create drag preview functions
  const createDragPreview = () => {
    if (dragPreview) return; // Already exists
    
    const previewElement = document.createElement('div');
    previewElement.id = `drag-preview-${charm.id}`;
    previewElement.style.cssText = `
      position: fixed;
      width: 60px;
      height: 60px;
      background-image: url(${charm.image});
      background-size: cover;
      background-position: center;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      pointer-events: none;
      z-index: 10000;
      border: 2px solid #FFB6C1;
      opacity: 0.9;
      transform: translate(-50%, -50%);
      transition: none;
    `;
    
    document.body.appendChild(previewElement);
    setDragPreview(previewElement);
    
    // Add mouse/touch move listener to follow cursor
    const handleMove = (e) => {
      if (!previewElement) return;
      
      const x = e.clientX || (e.touches && e.touches[0]?.clientX);
      const y = e.clientY || (e.touches && e.touches[0]?.clientY);
      
      if (x && y) {
        previewElement.style.left = x + 'px';
        previewElement.style.top = y + 'px';
      }
    };
    
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', handleMove);
    
    // Store event handlers for cleanup
    previewElement._cleanup = () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('touchmove', handleMove);
    };
  };
  
  const removeDragPreview = () => {
    if (dragPreview) {
      if (dragPreview._cleanup) {
        dragPreview._cleanup();
      }
      if (dragPreview.parentNode) {
        dragPreview.parentNode.removeChild(dragPreview);
      }
      setDragPreview(null);
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => removeDragPreview();
  }, []);

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