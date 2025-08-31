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
    accept: ['CHARM', 'PLACED_CHARM'],
    drop: (item, monitor) => {
      console.log('FreeDropArea drop called with item:', item);
      
      if (!monitor.didDrop()) {
        // Get the drop position relative to the drop area
        const dropAreaElement = drop.current;
        console.log('Drop area element:', dropAreaElement);
        
        if (!dropAreaElement) {
          console.log('No drop area reference, trying alternative approach');
          
          // Fallback: try to find the drop area by class name
          const fallbackDropArea = document.querySelector('.bc-product-overlapping');
          if (fallbackDropArea) {
            console.log('Found fallback drop area:', fallbackDropArea);
            const dropAreaRect = fallbackDropArea.getBoundingClientRect();
            const clientOffset = monitor.getClientOffset();
            
            if (clientOffset && dropAreaRect) {
              const x = ((clientOffset.x - dropAreaRect.left) / dropAreaRect.width) * 100;
              const y = ((clientOffset.y - dropAreaRect.top) / dropAreaRect.height) * 100;
              const clampedX = Math.min(Math.max(x, 10), 90);
              const clampedY = Math.min(Math.max(y, 10), 90);
              
              console.log('Fallback calculated position:', { x: clampedX, y: clampedY });
              
              const charm = item.charm || item;
              
              // For PLACED_CHARM items (repositioning), just return coordinates
              if (item.type === 'move') {
                console.log('Fallback: Returning coordinates for charm repositioning:', { x: clampedX, y: clampedY });
                return { x: clampedX, y: clampedY };
              }
              
              // For new charms, add to canvas
              const charmWithFreePosition = {
                ...charm,
                x: clampedX,
                y: clampedY,
                rotation: charm.rotation || 0,
                id: charm.id.includes && charm.id.includes('-') ? charm.id : `${charm.id}-${Date.now()}`
              };
              
              if (window.addCharmToCanvas) {
                window.addCharmToCanvas(charmWithFreePosition);
              }
              
              return { x: clampedX, y: clampedY };
            }
          }
          return;
        }

        const dropAreaRect = dropAreaElement.getBoundingClientRect();
        const clientOffset = monitor.getClientOffset();
        
        console.log('Drop area rect:', dropAreaRect);
        console.log('Client offset:', clientOffset);
        
        if (clientOffset && dropAreaRect) {
          // Calculate position as percentage of drop area dimensions
          const x = ((clientOffset.x - dropAreaRect.left) / dropAreaRect.width) * 100;
          const y = ((clientOffset.y - dropAreaRect.top) / dropAreaRect.height) * 100;
          
          // Clamp values to stay within bounds with some margin
          const clampedX = Math.min(Math.max(x, 10), 90);
          const clampedY = Math.min(Math.max(y, 10), 90);
          
          console.log('Calculated position:', { x: clampedX, y: clampedY });
          
          // Handle different item types
          const charm = item.charm || item;
          console.log('Processing drop for item type:', item.type);
          
          // For PLACED_CHARM items (repositioning), just return coordinates
          if (item.type === 'move') {
            console.log('Returning coordinates for charm repositioning:', { x: clampedX, y: clampedY });
            return { x: clampedX, y: clampedY };
          }
          
          // For new CHARM items, add to canvas
          if (onDrop) {
            // Pass the charm data directly to handleDrop
            const fakeEvent = {
              preventDefault: () => {},
              stopPropagation: () => {},
              position: {
                x: clampedX,
                y: clampedY
              }
            };
            
            console.log('Calling onDrop with charm:', charm, 'event:', fakeEvent);
            
            // Set up the current dragged item data for the existing handleDrop function
            // We'll create a simplified version that directly places the charm
            const charmWithFreePosition = {
              ...charm,
              x: clampedX,
              y: clampedY,
              rotation: charm.rotation || 0,
              id: charm.id.includes && charm.id.includes('-') ? charm.id : `${charm.id}-${Date.now()}`
            };
            
            // Call a simplified version of the drop handler
            if (window.addCharmToCanvas) {
              window.addCharmToCanvas(charmWithFreePosition);
            } else {
              onDrop(fakeEvent, null);
            }
            
            // Return position data for the drag system
            return { x: clampedX, y: clampedY };
          }
        }
        
        return { position: 'free' };
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
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