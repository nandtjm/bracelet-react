import React from 'react';

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
  setIsDragInProgress
}) => {
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: 0, marginBottom: '4px' }}>Charms <span style={{ fontWeight: '400', color: '#9ca3af' }}>(Optional Add On)</span></h3>
      </div>

      <div style={{ marginBottom: '20px', position: 'relative' }}>
        <input
          type="text"
          placeholder="Search"
          value={charmSearchQuery}
          onChange={(e) => setCharmSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px 12px 40px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        />
        <div style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#9ca3af'
        }}>🔍</div>
        <button style={{
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
                if (currentCount < 9) {
                  // Find first empty dropzone (0-8, left to right)
                  const occupiedDropzones = customization.selectedCharms.map(c => c.dropzoneIndex).filter(idx => idx !== undefined);
                  const firstEmptyDropzone = [0, 1, 2, 3, 4, 5, 6, 7, 8].find(index => !occupiedDropzones.includes(index));
                  
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
            <div 
              draggable={!charm.isSoldOut}
              onDragStart={(e) => {
                e.stopPropagation();
                handleDragStart(e, charm, 'charm');
              }}
              onDragEnd={() => {
                setIsDragInProgress(false);
              }}
              style={{ 
                width: '80px', 
                height: '80px', 
                background: '#f8f9fa', 
                borderRadius: '12px', 
                margin: '0 auto 12px',
                backgroundImage: `url(${charm.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                cursor: charm.isSoldOut ? 'not-allowed' : 'grab',
                position: 'relative'
              }}
            ></div>
            <div style={{ fontSize: '14px', marginBottom: '4px', fontWeight: '500' }}>{charm.name}</div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>${charm.price}</div>
          </div>
        ))}
      </div>

      {customization.selectedCharms.length > 0 && (
        <div style={{ 
          marginTop: '20px', 
          padding: '16px', 
          background: '#f8f9fa', 
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              cursor: 'pointer'
            }}
            onClick={() => setIsCharmSummaryExpanded(!isCharmSummaryExpanded)}
          >
            <h4 style={{ margin: 0, fontSize: '14px' }}>Your Charms ({customization.selectedCharms.length})</h4>
            <div style={{ 
              transform: isCharmSummaryExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
              fontSize: '16px'
            }}>
              ^
            </div>
          </div>
          
          {isCharmSummaryExpanded && (
            <div style={{ 
              marginTop: '12px',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              {Object.entries(
                customization.selectedCharms.reduce((acc, charm) => {
                  const key = `${charm.id}-${charm.name}`;
                  if (acc[key]) {
                    acc[key].quantity += 1;
                  } else {
                    acc[key] = { ...charm, quantity: 1 };
                  }
                  return acc;
                }, {})
              ).map(([key, charmData]) => (
                <div key={key} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      background: '#e5e7eb', 
                      borderRadius: '4px',
                      backgroundImage: `url(${charmData.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}></div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '500' }}>{charmData.name}</div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>${charmData.price}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '500' }}>x{charmData.quantity}</span>
                    <button
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '10px',
                        cursor: 'pointer'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCustomization({
                          ...customization,
                          selectedCharms: customization.selectedCharms.filter(c => c.id !== charmData.id)
                        });
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CharmsStep;