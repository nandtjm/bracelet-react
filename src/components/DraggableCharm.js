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
      
      // Create drag preview for all devices and get initial position
      // Try to get current cursor position from recent mouse events
      const getCurrentMousePosition = () => {
        return {
          x: window.lastMouseX || 100,
          y: window.lastMouseY || 100
        };
      };
      
      // Store initial position for preview
      const initialPos = getCurrentMousePosition();
      window.dragStartX = initialPos.x;
      window.dragStartY = initialPos.y;
      
      createDragPreview();
      
      return dragData;
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (_, _monitor) => {
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
    previewElement.className = 'bracelet-customizer-drag-preview';
    
    // Force all styles inline to override any CSS conflicts
    previewElement.setAttribute('style', `
      position: fixed !important;
      width: 60px !important;
      height: 60px !important;
      background-image: url(${charm.image}) !important;
      background-size: cover !important;
      background-position: center !important;
      background-color: transparent !important;
      border-radius: 12px !important;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3) !important;
      pointer-events: none !important;
      z-index: 999999 !important;
      border: none !important;
      opacity: 0.9 !important;
      transform: translate(-50%, -50%) !important;
      transition: none !important;
      display: block !important;
      visibility: visible !important;
      will-change: transform !important;
      top: 100px !important;
      left: 100px !important;
      min-width: 60px !important;
      min-height: 60px !important;
    `);
    
    document.body.appendChild(previewElement);
    setDragPreview(previewElement);
    
    // Track initial mouse position and make preview follow cursor immediately
    let isTracking = false;
    
    const startCursorTracking = () => {
      if (isTracking) return;
      isTracking = true;
      
      // Get current mouse position from global tracking or drag start position
      const initialX = window.lastMouseX || window.dragStartX || 100;
      const initialY = window.lastMouseY || window.dragStartY || 100;
      
      // Set initial position and make sure it's visible
      handleMove({ clientX: initialX, clientY: initialY });
    };
    
    // Start tracking immediately
    setTimeout(startCursorTracking, 10);
    
    // Position it at current cursor position immediately
    const setInitialPosition = (e) => {
      if (e && previewElement) {
        const x = e.clientX || 0;
        const y = e.clientY || 0;
        previewElement.style.left = x + 'px';
        previewElement.style.top = y + 'px';
      }
    };
    
    // Try to get current mouse position
    document.addEventListener('mousemove', function initPos(e) {
      setInitialPosition(e);
      document.removeEventListener('mousemove', initPos);
    }, { once: true });
    
    
    // Add mouse/touch move listener to follow cursor with improved tracking
    const handleMove = (e) => {
      if (!previewElement || !document.body.contains(previewElement)) return;
      
      const x = e.clientX || (e.touches && e.touches[0]?.clientX);
      const y = e.clientY || (e.touches && e.touches[0]?.clientY);
      
      if (x !== undefined && y !== undefined) {
        // Force visibility and positioning with maximum specificity
        previewElement.setAttribute('style', `
          position: fixed !important;
          left: ${x}px !important;
          top: ${y}px !important;
          width: 60px !important;
          height: 60px !important;
          background-image: url(${charm.image}) !important;
          background-size: cover !important;
          background-position: center !important;
          background-color: transparent !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3) !important;
          pointer-events: none !important;
          z-index: 999999 !important;
          border: none !important;
          opacity: 0.9 !important;
          transform: translate(-50%, -50%) !important;
          transition: none !important;
          display: block !important;
          visibility: visible !important;
          will-change: transform !important;
          min-width: 60px !important;
          min-height: 60px !important;
        `);
      }
    };
    
    // Get initial mouse position when drag starts
    const getInitialPosition = (e) => {
      handleMove(e);
    };
    
    // Listen for the first mousemove to get position
    document.addEventListener('mousemove', getInitialPosition, { once: true });
    
    // Global mouse tracking for better position awareness
    const trackGlobalMouse = (e) => {
      window.lastMouseX = e.clientX;
      window.lastMouseY = e.clientY;
      handleMove(e);
    };
    
    // Use device-appropriate event handling to not interfere with drop detection
    const isTouch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    
    if (isTouch) {
      // For touch devices, use comprehensive tracking
      document.addEventListener('touchmove', handleMove, { passive: true });
      document.addEventListener('mousemove', trackGlobalMouse, { passive: true });
    } else {
      // For mouse devices, use passive listeners to not interfere with HTML5Backend
      document.addEventListener('mousemove', trackGlobalMouse, { passive: true });
      document.addEventListener('dragstart', (e) => {
        // Track initial drag position
        handleMove(e);
      }, { passive: true });
    }
    
    // Store event handlers for cleanup
    previewElement._cleanup = () => {
      if (isTouch) {
        document.removeEventListener('touchmove', handleMove, { passive: true });
        document.removeEventListener('mousemove', trackGlobalMouse, { passive: true });
      } else {
        document.removeEventListener('mousemove', trackGlobalMouse, { passive: true });
        document.removeEventListener('dragstart', handleMove, { passive: true });
      }
    };
  };
  
  
  const removeDragPreview = () => {
    if (dragPreview) {
      if (dragPreview._cleanup) {
        try {
          dragPreview._cleanup();
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
      }
      // Safe DOM removal check with multiple safety layers
      try {
        if (dragPreview && 
            dragPreview.parentNode && 
            dragPreview.parentNode.contains && 
            dragPreview.parentNode.contains(dragPreview) && 
            document.body.contains(dragPreview)) {
          dragPreview.parentNode.removeChild(dragPreview);
        }
      } catch (error) {
        // Silently handle removeChild errors that can occur in React concurrent mode
      }
      setDragPreview(null);
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => removeDragPreview();
  }, []);

  // Set up HTML5 drag preview suppression and custom preview for mouse devices
  React.useEffect(() => {
    const isTouch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    if (!isTouch && preview) {
      // Use empty image to hide HTML5 drag preview, we'll handle it with custom preview
      const emptyImage = new Image();
      emptyImage.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
      emptyImage.onload = () => {
        preview(emptyImage, { captureDraggingState: false, offsetX: 0, offsetY: 0 });
      };
    }
  }, [preview]);
  
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