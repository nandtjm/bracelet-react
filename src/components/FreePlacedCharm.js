import React, { useState, useRef, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

const FreePlacedCharm = ({
  charm,
  onRemove,
  onRotate,
  onMove,
  isDragging = false
}) => {
  const [rotation, setRotation] = useState(charm.rotation || 0);
  const [isRotating, setIsRotating] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const charmRef = useRef(null);
  
  // Make the entire charm draggable for repositioning
  const [{ isDraggingItem }, drag, preview] = useDrag(() => ({
    type: 'PLACED_CHARM',
    item: { charm: { ...charm, rotation }, type: 'move' },
    collect: (monitor) => ({
      isDraggingItem: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      console.log('FreePlacedCharm drag end - dropResult:', dropResult);
      
      // If we got a drop result with coordinates, use those
      if (dropResult && dropResult.x !== undefined && dropResult.y !== undefined && onMove) {
        console.log('Moving charm to dropResult coordinates:', dropResult.x, dropResult.y);
        onMove(charm.id, dropResult.x, dropResult.y);
      } else {
        // Fallback: calculate position based on where the charm was dropped
        const clientOffset = monitor.getClientOffset();
        if (clientOffset) {
          const canvasElement = document.querySelector('.bc-product-overlapping');
          if (canvasElement) {
            const canvasRect = canvasElement.getBoundingClientRect();
            const x = ((clientOffset.x - canvasRect.left) / canvasRect.width) * 100;
            const y = ((clientOffset.y - canvasRect.top) / canvasRect.height) * 100;
            const clampedX = Math.min(Math.max(x, 10), 90);
            const clampedY = Math.min(Math.max(y, 10), 90);
            
            console.log('Moving charm to calculated coordinates:', clampedX, clampedY);
            
            if (onMove) {
              onMove(charm.id, clampedX, clampedY);
            }
          }
        }
      }
    }
  }), [charm, onMove, rotation]);

  // Create custom drag preview with correct rotation
  useEffect(() => {
    // Create a canvas element to render the rotated charm
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 60;
    canvas.height = 60;
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, 60, 60);
      
      // Set up rotation transformation
      ctx.save();
      ctx.translate(30, 30); // Move to center
      ctx.rotate((rotation * Math.PI) / 180); // Convert to radians
      
      // Draw the image centered and rotated
      ctx.drawImage(img, -30, -30, 60, 60);
      ctx.restore();
      
      // Convert canvas to data URL and set as preview
      const dataURL = canvas.toDataURL();
      const previewImg = new Image();
      previewImg.src = dataURL;
      previewImg.onload = () => {
        preview(previewImg);
      };
    };
    
    img.onerror = () => {
      // Fallback: use empty image if custom preview fails
      preview(getEmptyImage());
    };
    
    img.src = charm.image;
  }, [charm.image, rotation, preview]);

  // Handle free rotation with mouse drag
  const handleRotateStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRotating(true);
    
    const charmElement = charmRef.current;
    if (!charmElement) return;
    
    const rect = charmElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
    setDragStart({ startAngle, startRotation: rotation });
  };

  const handleRotateMove = (e) => {
    if (!isRotating || !dragStart) return;
    
    const charmElement = charmRef.current;
    if (!charmElement) return;
    
    const rect = charmElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
    const deltaAngle = currentAngle - dragStart.startAngle;
    const newRotation = (dragStart.startRotation + deltaAngle) % 360;
    
    setRotation(newRotation);
  };

  const handleRotateEnd = () => {
    if (isRotating) {
      setIsRotating(false);
      setDragStart(null);
      if (onRotate) {
        onRotate(charm.id, rotation);
      }
    }
  };

  // Global mouse event handlers
  useEffect(() => {
    if (isRotating) {
      document.addEventListener('mousemove', handleRotateMove);
      document.addEventListener('mouseup', handleRotateEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleRotateMove);
        document.removeEventListener('mouseup', handleRotateEnd);
      };
    }
  }, [isRotating, dragStart, rotation]);

  const handleRemove = () => {
    if (onRemove) {
      onRemove(charm.id);
    }
  };

  return (
    <div
      ref={charmRef}
      className="bc-free-placed-charm"
      style={{
        position: 'absolute',
        left: `${charm.x}%`,
        top: `${charm.y}%`,
        transform: `translate(-50%, -50%)`,
        zIndex: 15,
        opacity: isDraggingItem ? 0.5 : 1,
        pointerEvents: isDragging ? 'none' : 'auto'
      }}
    >
      {/* Rotation handle - drag to rotate freely */}
      <div
        className="bc-charm-rotate-handle"
        onMouseDown={handleRotateStart}
        style={{
          position: 'absolute',
          top: '-20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          border: '2px solid #f59e0b',
          background: 'white',
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001,
          fontSize: '12px',
          color: '#f59e0b',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          userSelect: 'none'
        }}
      >
        ○
      </div>

      {/* Close/remove button */}
      <button
        type="button"
        className="bc-charm-remove-handle"
        aria-label="Remove charm"
        onClick={handleRemove}
        style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(107, 114, 128, 0.9)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          zIndex: 1002,
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      >
        <svg
          stroke="currentColor"
          fill="currentColor"
          strokeWidth="0"
          viewBox="0 0 512 512"
          height="12px"
          width="12px"
        >
          <path d="m289.94 256 95-95A24 24 0 0 0 351 127l-95 95-95-95a24 24 0 0 0-34 34l95 95-95 95a24 24 0 1 0 34 34l95-95 95 95a24 24 0 0 0 34-34z"></path>
        </svg>
      </button>

      {/* Draggable charm container */}
      <div
        ref={drag}
        style={{
          width: '60px',
          height: '60px',
          cursor: isDraggingItem ? 'grabbing' : 'grab',
          transform: `rotate(${rotation}deg)`,
          position: 'relative'
        }}
      >
        {/* Charm image without background */}
        <img
          src={charm.image}
          alt={charm.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
            // Remove background and make transparent
            background: 'transparent',
            borderRadius: '0',
            boxShadow: 'none'
          }}
          draggable="false"
        />
      </div>
    </div>
  );
};

export default FreePlacedCharm;