import React, { useState } from 'react';
import DraggableCharm from './DraggableCharm';

const FreePlacedCharm = ({
  charm,
  onRemove,
  onRotate,
  onDragStart,
  onDragEnd,
  getImageUrl,
  isDragging = false
}) => {
  const [rotation, setRotation] = useState(charm.rotation || 0);

  const handleRotate = () => {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    if (onRotate) {
      onRotate(charm.id, newRotation);
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove(charm.id);
    }
  };

  return (
    <div
      className="bc-free-placed-charm"
      style={{
        position: 'absolute',
        left: `${charm.x}%`,
        top: `${charm.y}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        zIndex: 15,
        opacity: isDragging ? 0.5 : 1,
        pointerEvents: isDragging ? 'none' : 'auto'
      }}
    >
      {/* Rotation handle */}
      <button
        type="button"
        className="bc-charm-rotate-handle"
        aria-label="Rotate charm"
        onClick={handleRotate}
        style={{
          position: 'absolute',
          top: '-15px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          border: '2px solid #f59e0b',
          background: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001,
          fontSize: '10px',
          color: '#f59e0b',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        ↻
      </button>

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

      {/* Draggable charm */}
      <DraggableCharm
        charm={charm}
        isFromGrid={false}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        style={{
          width: '60px',
          height: '60px',
          cursor: 'grab'
        }}
      >
        <img
          src={charm.image}
          alt={charm.name}
          style={{
            width: '60px',
            height: '60px',
            objectFit: 'contain',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            pointerEvents: 'none'
          }}
          draggable="false"
        />
      </DraggableCharm>
    </div>
  );
};

export default FreePlacedCharm;