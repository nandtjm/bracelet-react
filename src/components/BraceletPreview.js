import React, { useState } from 'react';
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
  rotateFreePlacedCharm,
  moveFreePlacedCharm
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

  // Check if we're in the charm step
  const isCharmStep = ((isStandardMode && currentStep === 3) || (isNoWordsMode && currentStep === 2)) && !isReviewMode;
  
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
            {/* Conditional wrapper - FreeDropArea for charm step, regular div otherwise */}
            {isCharmStep ? (
              <FreeDropArea
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="bc-product-overlapping"
              >
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

                {/* Interactive charms with controls during charm step */}
                {customization.selectedCharms
                  .filter(charm => charm.x !== undefined && charm.y !== undefined)
                  .map((charm, index) => (
                    <FreePlacedCharm
                      key={`free-charm-${charm.id}-${index}`}
                      charm={charm}
                      onRemove={removeFreePlacedCharm}
                      onRotate={rotateFreePlacedCharm}
                      onMove={moveFreePlacedCharm}
                      isDragging={isDragInProgress}
                    />
                  ))}

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
              </FreeDropArea>
            ) : (
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

                {/* Static display for other steps */}
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
            )}

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