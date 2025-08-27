import React from 'react';
import DraggableCharm from './DraggableCharm';

const CharmsStep = ({ 
  charmCategories,
  selectedCharmCategory,
  setSelectedCharmCategory,
  charmSearchQuery,
  setCharmSearchQuery,
  charmsByCategory,
  customization,
  setCustomization,
  hoveredCharm,
  setHoveredCharm,
  handleDragStart,
  isCharmSummaryExpanded,
  setIsCharmSummaryExpanded,
  setIsDragInProgress,
  formatPrice,
  selectedBracelet
}) => {
  // Determine max charms based on product type
  const isNoWordsMode = selectedBracelet && selectedBracelet.category === 'No Words';
  const maxCharms = isNoWordsMode ? 7 : 9;
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h3 className='bc-charms-label' style={{ margin: 0, marginBottom: '4px' }}>Charms <span style={{ fontWeight: '400', color: '#9ca3af' }}>(Optional Add On)</span></h3>
      </div>

      <div className='bc-charms-search' style={{ marginBottom: '20px', position: 'relative' }}>
        <input
          type="text"
          placeholder="Search"
          value={charmSearchQuery}
          onChange={(e) => setCharmSearchQuery(e.target.value)}
          className='bc-charms-search-input'
          style={{
            width: '100%',
            padding: '12px 16px 12px 40px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box',
            marginBottom: 'revert',
            height: 'revert'
          }}
        />
        <div style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#9ca3af'
        }}>🔍</div>
        <button 
          id="bc-search-clear-btn"
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: '#FFB6C1',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: '500',
            cursor: 'pointer'
          }}>
          FILTER & SORT
        </button>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div 
          className="category-scroll"
          style={{
            display: 'flex',
            overflowX: 'auto',
            gap: '8px',
            paddingBottom: '8px'
          }}
        >
          {charmCategories.map(category => (
            <button
              key={category}
              id='bc-charm-category-{{category}}'
              className='bc-charm-category-button'
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '20px',
                background: selectedCharmCategory === category ? '#FFB6C1' : '#f8f9fa',
                color: selectedCharmCategory === category ? '#000' : '#6b7280',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.2s ease'
              }}
              onClick={() => setSelectedCharmCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {charmsByCategory[selectedCharmCategory]
          .filter(charm => 
            charmSearchQuery === '' || 
            charm.name.toLowerCase().includes(charmSearchQuery.toLowerCase())
          )
          .map(charm => (
          <div
            className='bc-charm-card'
            key={charm.id}
            style={{
              padding: '16px',
              border: 'solid',
              borderWidth: '1px',
              borderRadius: '16px',
              backgroundColor: 'rgb(253 251 247 / 1)',
              borderColor: hoveredCharm === charm.id ? 'rgb(107 114 128 / 1)' : 'rgb(214 212 204 / 1)',
              textAlign: 'center',
              cursor: charm.isSoldOut ? 'not-allowed' : 'pointer',
              opacity: charm.isSoldOut ? 0.5 : 1,
              position: 'relative',
              boxShadow: hoveredCharm === charm.id ? '0 4px 16px rgba(0,0,0,0.16)' : '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseEnter={() => setHoveredCharm(charm.id)}
            onMouseLeave={() => setHoveredCharm(null)}
            onClick={() => {
              if (!charm.isSoldOut) {
                const currentCount = customization.selectedCharms.filter(c => c.id === charm.id).length;
                if (currentCount < maxCharms) {
                  // Find first empty dropzone based on product type
                  const occupiedDropzones = customization.selectedCharms.map(c => c.dropzoneIndex).filter(idx => idx !== undefined);
                  const availableDropzones = isNoWordsMode ? [0, 1, 2, 3, 4, 5, 6] : [0, 1, 2, 3, 4, 5, 6, 7, 8];
                  const firstEmptyDropzone = availableDropzones.find(index => !occupiedDropzones.includes(index));
                  
                  if (firstEmptyDropzone !== undefined) {
                    const charmWithPosition = {
                      ...charm,
                      dropzoneIndex: firstEmptyDropzone,
                      positionId: `dropzone-${firstEmptyDropzone}`
                    };
                    
                    setCustomization({
                      ...customization,
                      selectedCharms: [...customization.selectedCharms, charmWithPosition]
                    });
                  }
                }
              }
            }}
          >
            {charm.isNew && (
              <div style={{
                position: 'absolute',
                top: '4px',
                left: '4px',
                background: '#4F46E5',
                color: 'white',
                fontSize: '8px',
                fontWeight: '600',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                NEW
              </div>
            )}
            {charm.isSoldOut && (
              <div style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                background: '#ef4444',
                color: 'white',
                fontSize: '8px',
                fontWeight: '600',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                SOLD OUT
              </div>
            )}
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '28px',
              height: '28px',
              border: '2px solid #4F46E5',
              borderRadius: '50%',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              color: '#4F46E5',
              fontWeight: '600',
              pointerEvents: 'none',
              zIndex: 10
            }}>
              +
            </div>
            <DraggableCharm
              charm={charm}
              isFromGrid={true}
              onDragStart={handleDragStart}
              onDragEnd={() => {
                setIsDragInProgress(false);
              }}
              disabled={charm.isSoldOut}
              style={{ 
                width: '80px', 
                height: '80px', 
                background: '#f8f9fa', 
                borderRadius: '12px', 
                margin: '0 auto 12px',
                backgroundImage: `url(${charm.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
              }}
            >
              {/* Charm content inside the draggable wrapper */}
              <div style={{ 
                width: '100%', 
                height: '100%', 
                borderRadius: '12px',
                backgroundImage: `url(${charm.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }} />
            </DraggableCharm>
            <div style={{ fontSize: '14px', marginBottom: '4px', fontWeight: '500' }}>{charm.name}</div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>{formatPrice ? formatPrice(charm.price) : `$${charm.price}`}</div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default CharmsStep;