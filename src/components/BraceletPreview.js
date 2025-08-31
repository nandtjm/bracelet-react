import React, { useState } from 'react';
import CharmDropzone from './CharmDropzone';
import DraggableCharm from './DraggableCharm';
import FreeDropArea from './FreeDropArea';
import FreePlacedCharm from './FreePlacedCharm';

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
  setIsDragInProgress,
  selectedBracelet,
  getImageUrl,
  removeFreePlacedCharm,
  rotateFreePlacedCharm
}) => {
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [draggingCharmIndex, setDraggingCharmIndex] = useState(null);
  
  // Check product types
  const isCollabsMode = selectedBracelet && selectedBracelet.category === 'Collabs';
  const isTinyWordsMode = selectedBracelet && selectedBracelet.category === 'Tiny Words';
  const isNoWordsMode = selectedBracelet && selectedBracelet.category === 'No Words';
  const isStandardMode = selectedBracelet && selectedBracelet.category === 'Standard';
  // Get the appropriate bracelet image based on mode
  const getDisplayImage = () => {
    if (isCollabsMode || isNoWordsMode) {
      // For Collabs and No Words, always use the main static image
      return selectedBracelet.image;
    } else {
      // For standard bracelets, use dynamic image based on word length
      return getBraceletImage();
    }
  };
  
  // Get main charm image from selected bracelet
  const getMainCharmImage = () => {
    if (!selectedBracelet) return '';
    
    // Check if bracelet has main charm image data
    if (selectedBracelet.mainCharmImage) {
      return getImageUrl(selectedBracelet.mainCharmImage);
    }
    
    // Only Standard products should have main charm images
    if (!isStandardMode) {
      return ''; // No main charm for non-Standard products
    }
    
    // Fallback to hardcoded image only for Standard products when no meta exists
    return "https://cld.accentuate.io/6899436781649/1655920066230/Charm-gold-yellow.Denoiser-moved.png?v=1724640829437&options=w_900";
  };
  
  return (
    <div style={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div style={{ textAlign: 'center' }}>
        <div className="bc-bracelet-preview-container">
          <div className="bc-product-canvas">
            <div className="bc-product-overlapping">
              <img
                src={getDisplayImage()}
                alt="Custom Bracelet"
                className="bc-main-bracelet-image"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />

              {/* Main charm overlay - only show for Standard products that have main charm data */}
              {isStandardMode && getMainCharmImage() && (
                <div className="bc-product-overlapping-main-charm">
                  <img
                    src={getMainCharmImage()}
                    alt="Main Charm"
                    loading="lazy"
                    width="900"
                    height="900"
                    className="max-w-full h-full object-contain"
                  />
                </div>
              )}
              
              {/* Interactive Dropzones - show for Standard products in charm step (step 3) and No Words products in charm step (step 2) */}
              {((isStandardMode && currentStep === 3) || (isNoWordsMode && currentStep === 2)) && !isReviewMode && (
                <div className="bc-product-overlapping-dropzone" data-customizer-dropzone="true">
                  {(isNoWordsMode ? [
                    { left: '40%', top: '65%' },  // 1st position
                    { left: '27%', top: '53%' },  // 2nd position
                    { left: '29.5%', top: '33%' }, // 3rd position
                    { left: '41%', top: '24%' },  // 4th position
                    { left: '56%', top: '28%' },  // 5th position
                    { left: '65%', top: '41%' },  // 6th position
                    { left: '62%', top: '58%' }   // 7th position
                  ] : [
                    { left: '18.5%', top: '70%' },
                    { left: '8%', top: '53%' },
                    { left: '10%', top: '33%' },
                    { left: '23%', top: '14%' },
                    { left: '46%', top: '7%' },
                    { left: '68%', top: '15%' },
                    { left: '82%', top: '33%' },
                    { left: '83%', top: '52.5%' },
                    { left: '73%', top: '69%' }
                  ]).map((position, index) => {
                    const charmInThisDropzone = customization.selectedCharms.find(c => c.dropzoneIndex === index);
                    const isOccupied = !!charmInThisDropzone;
                    
                    return (
                      <CharmDropzone
                        key={index}
                        dropzoneIndex={index}
                        onDrop={handleDrop}
                        onDragOver={(e) => {
                          handleDragOver(e);
                          setDragOverIndex(index);
                        }}
                        isOccupied={isOccupied}
                        style={{ 
                          left: position.left, 
                          top: position.top
                        }}
                      >
                        <div className="bc-magnetic-zone"></div>
                        
                        {/* Charm content - only show if charm is placed */}
                        {charmInThisDropzone && (
                          <>
                            <button 
                              type="button" 
                              className="bc-draggable-inner-item-remove" 
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
                            
                            <DraggableCharm
                              charm={{ ...charmInThisDropzone, currentDropzoneIndex: index }}
                              isFromGrid={false}
                              currentDropzoneIndex={index}
                              className="bc-draggable-inner-item"
                              onDragStart={(e) => {
                                setDraggingCharmIndex(index);
                                handleDragStart(e, { ...charmInThisDropzone, currentDropzoneIndex: index }, 'placed-charm');
                              }}
                              onDragEnd={() => {
                                setDraggingCharmIndex(null);
                                setDragOverIndex(null);
                                setIsDragInProgress(false);
                              }}
                              style={{ 
                                ...getCharmPositionStyles(index),
                                position: 'absolute',
                                width: '80px',
                                height: '80px',
                                zIndex: 15
                              }}
                            >
                              <img 
                                src={getCharmPositionImagePath(charmInThisDropzone.name, index)}
                                alt={charmInThisDropzone.name} 
                                loading="eager" 
                                className="max-w-full h-full object-contain bc-draggable-inner-item-image" 
                                style={{ 
                                  pointerEvents: 'none',
                                  maxWidth: '80px',
                                  maxHeight: '80px',
                                  width: 'auto',
                                  height: 'auto'
                                }}
                              />
                            </DraggableCharm>
                          </>
                        )}
                      </CharmDropzone>
                    );
                  })}
                </div>
              )}

              {/* Placed Charms visible on other steps - show for Standard products (not on step 3) and No Words products (not on step 2)  */}
               { ((isStandardMode && (currentStep !== 3 || isReviewMode)) || (isNoWordsMode && (currentStep !== 2 || isReviewMode))) && (
                <div className="bc-product-overlapping-dropzone" data-customizer-dropzone="true">
                  {(isNoWordsMode ? [
                    { left: '40%', top: '65%' },  // 1st position
                    { left: '27%', top: '53%' },  // 2nd position
                    { left: '29.5%', top: '33%' }, // 3rd position
                    { left: '41%', top: '24%' },  // 4th position
                    { left: '56%', top: '28%' },  // 5th position
                    { left: '65%', top: '41%' },  // 6th position
                    { left: '62%', top: '58%' }   // 7th position
                  ] : [
                    { left: '18.5%', top: '70%' },
                    { left: '8%', top: '53%' },
                    { left: '10%', top: '33%' },
                    { left: '23%', top: '14%' },
                    { left: '46%', top: '7%' },
                    { left: '68%', top: '15%' },
                    { left: '82%', top: '33%' },
                    { left: '83%', top: '52.5%' },
                    { left: '73%', top: '69%' }
                  ]).map((position, index) => {
                    const charmInThisDropzone = customization.selectedCharms.find(c => c.dropzoneIndex === index);
                    
                    if (!charmInThisDropzone) return null;
                    
                    return (
                      <div 
                        key={index}
                        className="bc-dropzone"
                        style={{ 
                          left: position.left, 
                          top: position.top,
                          background: 'transparent',
                          border: 'none',
                          // Hide dropzone visual indicators in review mode OR when charm is placed
                          visibility: (isReviewMode || charmInThisDropzone) ? 'hidden' : 'visible'
                        }}
                      >
                        <div className="bc-magnetic-zone" style={{
                          visibility: (isReviewMode || charmInThisDropzone) ? 'hidden' : 'visible'
                        }}></div>
                        
                        {/* Close button - visible for Standard products in charm step and No Words products in charm step */}
                        {((isStandardMode && currentStep === 3) || (isNoWordsMode && currentStep === 2)) && (
                        <button 
                          type="button" 
                          className="bc-draggable-inner-item-remove" 
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
                            display: 'flex',
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
                        )}
                        
                        <div 
                          className="bc-drag-box bc-draggable-inner-item" 
                          draggable={!isReviewMode && (isStandardMode || (isNoWordsMode && currentStep === 2))}
                          data-original-scale="6" 
                          data-draggable={!isReviewMode && (isStandardMode || (isNoWordsMode && currentStep === 2))}
                          role="button" 
                          tabIndex={isReviewMode || (isNoWordsMode && currentStep !== 2) || (isCollabsMode || isTinyWordsMode) ? -1 : 0}
                          aria-disabled={isReviewMode || (isNoWordsMode && currentStep !== 2) || (isCollabsMode || isTinyWordsMode)}
                          aria-roledescription={isReviewMode || (isNoWordsMode && currentStep !== 2) || (isCollabsMode || isTinyWordsMode) ? "" : "draggable"}
                          style={{ 
                            ...getCharmPositionStyles(index),
                            position: 'absolute',
                            width: '80px',
                            height: '80px',
                            cursor: isReviewMode || (isNoWordsMode && currentStep !== 2) || (isCollabsMode || isTinyWordsMode) ? 'default' : 'grab',
                            zIndex: 15,
                            opacity: 1,
                            transition: 'opacity 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            visibility: 'visible'
                          }}
                          onDragStart={!isReviewMode && (isStandardMode || (isNoWordsMode && currentStep === 2)) ? (e) => {
                            e.stopPropagation();
                            handleDragStart(e, { ...charmInThisDropzone, currentDropzoneIndex: index }, 'placed-charm');
                          } : undefined}
                          onDragEnd={!isReviewMode && (isStandardMode || (isNoWordsMode && currentStep === 2)) ? () => {
                            setIsDragInProgress(false);
                          } : undefined}
                        >
                          <img 
                            src={getCharmPositionImagePath(charmInThisDropzone.name, index)}
                            alt={charmInThisDropzone.name} 
                            loading="eager" 
                            className="max-w-full h-full object-contain bc-draggable-inner-item-image" 
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
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Free placement drop area and charms - NEW SYSTEM */}
              {((isStandardMode && currentStep === 3) || (isNoWordsMode && currentStep === 2)) && !isReviewMode && (
                <FreeDropArea
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 1
                  }}
                >
                  {/* Free placed charms */}
                  {customization.selectedCharms
                    .filter(charm => charm.x !== undefined && charm.y !== undefined)
                    .map((charm, index) => (
                      <FreePlacedCharm
                        key={`free-charm-${charm.id}-${index}`}
                        charm={charm}
                        onRemove={removeFreePlacedCharm}
                        onRotate={rotateFreePlacedCharm}
                        onDragStart={(e) => handleDragStart(e, charm, 'free-placed-charm')}
                        onDragEnd={() => setIsDragInProgress(false)}
                        getImageUrl={getImageUrl}
                        isDragging={isDragInProgress}
                      />
                    ))}
                </FreeDropArea>
              )}

              {/* Free placed charms - visible on other steps (static display) */}
              {((isStandardMode && (currentStep !== 3 || isReviewMode)) || (isNoWordsMode && (currentStep !== 2 || isReviewMode))) && (
                <div className="bc-free-placed-charms-static" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }}>
                  {customization.selectedCharms
                    .filter(charm => charm.x !== undefined && charm.y !== undefined)
                    .map((charm, index) => (
                      <div
                        key={`static-charm-${charm.id}-${index}`}
                        style={{
                          position: 'absolute',
                          left: `${charm.x}%`,
                          top: `${charm.y}%`,
                          transform: `translate(-50%, -50%) rotate(${charm.rotation || 0}deg)`,
                          zIndex: 15
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
                      </div>
                    ))}
                </div>
              )}
              
              {/* Letter overlays - show for Tiny Words and Standard products only */}
              {(isTinyWordsMode || isStandardMode) && (
                <div className="bc-product-overlapping-content">
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
                          className="bc-product-overlapping-letter"
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
              )}
            </div>

            {/* Letter dropzones - hide for Collabs and No Words products */}
            {!isCollabsMode && !isNoWordsMode && !customization.word && [...Array(13)].map((_, dropIndex) => {
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
                  className="bc-letter-dropzone"
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
        
        {/* Charm instruction text - hide for Collabs products, adjust step for No Words products */}
        {!isCollabsMode && currentStep === (isNoWordsMode ? 2 : 3) && !isReviewMode && (
          <div style={{
            marginTop: '20px',
            fontSize: '14px',
            color: '#ef4444',
            textAlign: 'center'
          }}>
Drag & drop your charm anywhere on the bracelet. Use the rotate button (↻) to rotate charms and the × button to remove them.
          </div>
        )}
      </div>
    </div>
  );
};

export default BraceletPreview;