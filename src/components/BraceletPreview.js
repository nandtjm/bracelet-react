import React, { useState } from 'react';

const BraceletPreview = ({ 
  customization, 
  currentStep, 
  isReviewMode,
  getBraceletImage,
  processWordForDisplay,
  getLetterImagePath,
  handleDragOver,
  handleDrop,
  removeCharmFromDropzone,
  getCharmPositionImagePath,
  getCharmPositionStyles,
  charmImageDimensions,
  handleDragStart,
  getCloseButtonPosition,
  isDragInProgress,
  setIsDragInProgress
}) => {
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [draggingCharmIndex, setDraggingCharmIndex] = useState(null);
  return (
    <div style={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div style={{ textAlign: 'center' }}>
        <div className="bracelet-preview-container">
          <div className="product-canvas">
            <div className="product-overlapping">
              <img
                src={getBraceletImage()}
                alt="Custom Bracelet"
                className="main-bracelet-image"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />

              <div className="_productOverlappingMainCharm_c850n_13">
                <img
                  src="https://cld.accentuate.io/6899436781649/1655920066230/Charm-gold-yellow.Denoiser-moved.png?v=1724640829437&options=w_900"
                  alt=""
                  loading="lazy"
                  width="900"
                  height="900"
                  className="max-w-full h-full object-contain"
                />
              </div>
              
              {/* Dropzones - always visible in step 3 */}
              {currentStep === 3 && !isReviewMode && (
                <div className="_productOverlappingDropzone_c850n_42" data-customizer-dropzone="true">
                  {[
                    { left: '18.5%', top: '70%' },
                    { left: '8%', top: '53%' },
                    { left: '10%', top: '33%' },
                    { left: '23%', top: '14%' },
                    { left: '46%', top: '7%' },
                    { left: '68%', top: '15%' },
                    { left: '82%', top: '33%' },
                    { left: '83%', top: '52.5%' },
                    { left: '73%', top: '69%' }
                  ].map((position, index) => {
                    const charmInThisDropzone = customization.selectedCharms.find(c => c.dropzoneIndex === index);
                    const isOccupied = !!charmInThisDropzone;
                    
                    return (
                      <div 
                        key={index}
                        className={`_dropzone_1xii1_43 ${!isOccupied ? '_dropzoneFull_1xii1_49' : ''}`}
                        style={{ 
                          left: position.left, 
                          top: position.top,
                          background: !isOccupied && dragOverIndex === index ? 'rgba(218, 159, 196, 0.8)' : (isOccupied ? 'transparent' : undefined),
                          boxShadow: !isOccupied && dragOverIndex === index ? '0 0 15px 6px #da9fc4aa' : (isOccupied ? 'none' : undefined),
                          border: isOccupied ? 'none' : undefined,
                          transform: !isOccupied && dragOverIndex === index ? 'scale(1.2)' : 'scale(1)',
                          transition: 'all 0.2s ease',
                          zIndex: dragOverIndex === index ? 20 : 5
                        }}
                        onDragOver={(e) => {
                          handleDragOver(e);
                          setDragOverIndex(index);
                        }}
                        onDragLeave={() => setDragOverIndex(null)}
                        onDrop={(e) => {
                          handleDrop(e, index);
                          setDragOverIndex(null);
                        }}
                      >
                        <div className="_magneticZone_1xii1_5"></div>
                        
                        {/* Charm content - only show if charm is placed */}
                        {charmInThisDropzone && (
                          <>
                            <button 
                              type="button" 
                              className="_draggableInnerItemRemove_1xii1_36" 
                              aria-label="Remove" 
                              data-draggable-remove="true" 
                              style={{ 
                                position: 'absolute',
                                ...getCloseButtonPosition(index),
                                background: 'rgba(107, 114, 128, 0.8)',
                                border: 'none',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                width: '20px',
                                height: '20px',
                                display: draggingCharmIndex === index ? 'none' : 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                zIndex: 1000
                              }}
                              onClick={() => removeCharmFromDropzone(charmInThisDropzone.id, index)}
                            >
                              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="18px" width="18px" style={{ minWidth: '18px', minHeight: '18px', maxWidth: '18px', maxHeight: '18px' }}>
                                <path d="m289.94 256 95-95A24 24 0 0 0 351 127l-95 95-95-95a24 24 0 0 0-34 34l95 95-95 95a24 24 0 1 0 34 34l95-95 95 95a24 24 0 0 0 34-34z"></path>
                              </svg>
                            </button>
                            
                            <div 
                              className="_dragBox_fya8s_1 _draggableInnerItem_1xii1_16" 
                              draggable="true" 
                              data-original-scale="6" 
                              data-draggable="true" 
                              role="button" 
                              tabIndex={0} 
                              aria-disabled="false" 
                              aria-roledescription="draggable" 
                              style={{ 
                                ...getCharmPositionStyles(index),
                                position: 'absolute',
                                width: '80px',
                                height: '80px',
                                cursor: 'grab',
                                zIndex: 15,
                                opacity: draggingCharmIndex === index ? 0.5 : 1,
                                transition: 'opacity 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              onDragStart={(e) => {
                                e.stopPropagation();
                                setDraggingCharmIndex(index);
                                handleDragStart(e, { ...charmInThisDropzone, currentDropzoneIndex: index }, 'placed-charm');
                              }}
                              onDragEnd={() => {
                                setDraggingCharmIndex(null);
                                setDragOverIndex(null);
                                setIsDragInProgress(false);
                              }}
                            >
                              <img 
                                src={getCharmPositionImagePath(charmInThisDropzone.name, index)}
                                alt={charmInThisDropzone.name} 
                                loading="eager" 
                                className="max-w-full h-full object-contain _draggableInnerItemImage_1xii1_23" 
                                style={{ 
                                  pointerEvents: 'none',
                                  maxWidth: '80px',
                                  maxHeight: '80px',
                                  width: 'auto',
                                  height: 'auto'
                                }}
                                draggable="false"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Placed Charms visible on other steps (1, 2, review) */}
              {(currentStep !== 3 || isReviewMode) && customization.selectedCharms.map(charm => {
                if (charm.dropzoneIndex === undefined) return null;
                
                const position = [
                  { left: '18.5%', top: '70%' },
                  { left: '8%', top: '53%' },
                  { left: '10%', top: '33%' },
                  { left: '23%', top: '14%' },
                  { left: '46%', top: '7%' },
                  { left: '68%', top: '15%' },
                  { left: '82%', top: '33%' },
                  { left: '83%', top: '52.5%' },
                  { left: '73%', top: '69%' }
                ][charm.dropzoneIndex];
                
                return (
                  <div 
                    key={`charm-other-steps-${charm.id}-${charm.dropzoneIndex}`}
                    style={{
                      ...getCharmPositionStyles(charm.dropzoneIndex),
                      position: 'absolute',
                      left: position.left,
                      top: position.top,
                      width: '80px',
                      height: '80px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 15
                    }}
                  >
                    <img 
                      src={getCharmPositionImagePath(charm.name, charm.dropzoneIndex)}
                      alt={charm.name} 
                      loading="eager" 
                      className="max-w-full h-full object-contain" 
                      style={{ 
                        maxWidth: '80px',
                        maxHeight: '80px',
                        width: 'auto',
                        height: 'auto'
                      }}
                      draggable="false"
                    />
                  </div>
                );
              })}
              
              <div className="product-overlapping-content">
                {customization.word && customization.word.replace(/\s/g, '').length >= 2 && (() => {
                  const totalCharCount = customization.word.length;
                  let letterPosition = 0;
                  
                  return processWordForDisplay(customization.word).map((item, itemIndex) => {
                    const isTrailingSpace = item.isSpace && 
                      !customization.word.slice(itemIndex + 1).replace(/\s/g, '').length;
                    
                    const imageImagePath = getLetterImagePath(
                      item.char, 
                      letterPosition, 
                      totalCharCount, 
                      customization.letterColor,
                      isTrailingSpace
                    );
                    const currentLetterPosition = letterPosition;
                    letterPosition++;
                    
                    if (!imageImagePath) {
                      return null;
                    }
                    
                    return (
                      <div 
                        key={`${item.isSpace ? 'space' : 'letter'}-${itemIndex}`}
                        className="product-overlapping-letter"
                        style={{ zIndex: 20 - currentLetterPosition }}
                      >
                        <img
                          src={imageImagePath}
                          alt={item.isSpace ? ' ' : item.char}
                          loading="lazy"
                          width="1500"
                          height="1500"
                          className="max-w-full h-full object-contain"
                          style={{ zIndex: 20 - currentLetterPosition }}
                        />
                      </div>
                    );
                  }).filter(Boolean);
                })()}
              </div>
            </div>

            {!customization.word && [...Array(13)].map((_, dropIndex) => {
              const angleRange = 120;
              const startAngle = 210 - (angleRange / 2);
              const angleStep = angleRange / 14;
              const angle = startAngle + (angleStep * (dropIndex + 1));
              
              const radius = 165;
              const x = Math.cos(angle * Math.PI / 180) * radius;
              const y = Math.sin(angle * Math.PI / 180) * radius;
              
              return (
                <div
                  key={`dropzone-${dropIndex}`}
                  className="letter-dropzone"
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    border: '1px dashed rgba(255,255,255,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    color: 'rgba(255,255,255,0.5)',
                    zIndex: 5
                  }}
                >
                </div>
              );
            })}
          </div>
        </div>
        
        {currentStep === 3 && !isReviewMode && (
          <div style={{
            marginTop: '20px',
            fontSize: '14px',
            color: '#ef4444',
            textAlign: 'center'
          }}>
Drag & drop your charm to any highlighted spot. You can also drag placed charms to move them between spots.
          </div>
        )}
      </div>
    </div>
  );
};

export default BraceletPreview;