import React, { useState } from 'react';
import './App.css';
import mockData from './data/mockData.json';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [customization, setCustomization] = useState({
    braceletStyle: 'bluestone',
    word: '', // Ensure word starts empty
    letterColor: 'white',
    selectedCharms: [],
    size: 'xs'
  });
  const [selectedCategory, setSelectedCategory] = useState('Standard');

  const steps = ['Design', 'Word', 'Charms'];
  const categories = mockData.categories.map(cat => cat.name);
  const trendingWords = mockData.trendingWords;
  const charmCategories = mockData.charmCategories.map(cat => cat.name);
  
  const [selectedCharmCategory, setSelectedCharmCategory] = useState('All');
  const [charmSearchQuery, setCharmSearchQuery] = useState('');
  const [isCharmSummaryExpanded, setIsCharmSummaryExpanded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [hoveredCharm, setHoveredCharm] = useState(null);
  
  // Organize bracelets by category
  const braceletsByCategory = {
    'All': mockData.bracelets,
    'Standard': mockData.bracelets.filter(b => b.category === 'standard'),
    'Collabs': mockData.bracelets.filter(b => b.category === 'collabs'),
    'Limited Edition': mockData.bracelets.filter(b => b.category === 'limited-edition'),
    'Engraving': mockData.bracelets.filter(b => b.category === 'engraving'),
    'Tiny Words': mockData.bracelets.filter(b => b.category === 'tiny-words')
  };

  // Organize charms by category
  const charmsByCategory = {
    'All': mockData.charms,
    'Bestsellers': mockData.charms.filter(c => c.category === 'bestsellers'),
    'New Drops & Favs': mockData.charms.filter(c => c.category === 'new-drops'),
    'Personalize it': mockData.charms.filter(c => c.category === 'personalize-it')
  };

  // Character validation (for allowed characters and length)
  const isValidCharacters = (text) => {
    const allowedChars = /^[a-zA-Z0-9:)\<3!#&:\s]*$/;
    return allowedChars.test(text) && text.length <= 13;
  };

  // Final validation (for completed words)
  const isValidWord = (text) => {
    return text === '' || (text.length >= 2 && text.length <= 13 && isValidCharacters(text));
  };

  // Get selected bracelet data
  const getSelectedBracelet = () => {
    return mockData.bracelets.find(b => b.id === customization.braceletStyle) || mockData.bracelets[0];
  };

  // Get the appropriate bracelet image based on word character count
  const getBraceletImage = () => {
    const selectedBracelet = getSelectedBracelet();
    
    if (!customization.word || customization.word.length === 0) {
      return selectedBracelet.image; // No gaps image
    }
    
    // Count all characters including spaces for bracelet variant selection
    const totalCharCount = customization.word.length;
    
    // Only show gap images if there are at least 2 non-space characters
    const nonSpaceCharCount = customization.word.replace(/\s/g, '').length;
    if (nonSpaceCharCount < 2) {
      return selectedBracelet.image;
    }
    
    // Use appropriate gap image based on total character count including spaces (2-13)
    if (totalCharCount >= 2 && totalCharCount <= 13 && selectedBracelet.gapImages) {
      return selectedBracelet.gapImages[totalCharCount.toString()] || selectedBracelet.image;
    }
    
    return selectedBracelet.image;
  };

  // Get letter image path for pre-rendered positioning (updated for direct key access)
  const getCenteredBraceletPositions = (wordLength) => {
    // Position 7 is center. Pattern based on your specification:
    // Even numbers: Start from 7,8 and expand outward  
    // Odd numbers: Center on 7 and expand both ways
    const positionMaps = {
      1: [7],
      2: [7, 8],                           // Start 7,8
      3: [6, 7, 8],                        // Center on 7: add 6 before
      4: [6, 7, 8, 9],                     // From 7,8 → add 6 before, 9 after  
      5: [5, 6, 7, 8, 9],                  // From 6,7,8 → add 5 before, 9 after
      6: [5, 6, 7, 8, 9, 10],              // From 6,7,8,9 → add 5 before, 10 after
      7: [4, 5, 6, 7, 8, 9, 10],           // From 5,6,7,8,9 → add 4 before, 10 after
      8: [4, 5, 6, 7, 8, 9, 10, 11],       // From 5,6,7,8,9,10 → add 4 before, 11 after
      9: [3, 4, 5, 6, 7, 8, 9, 10, 11],    // From 4,5,6,7,8,9,10 → add 3 before, 11 after
      10: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // From 4,5,6,7,8,9,10,11 → add 3 before, 12 after
      11: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // From 3,4,5,6,7,8,9,10,11 → add 2 before, 12 after
      12: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], // From 3,4,5,6,7,8,9,10,11,12 → add 2 before, 13 after
      13: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] // All positions
    };
    
    return positionMaps[wordLength] || [7];
  };

  const getSpaceStoneImagePath = (braceletType, braceletPosition, totalCharCount) => {
    // Space stone pattern: {BraceletType}-{Position}-{O/E}.png
    // O/E based on total word length (same as letters): O for odd, E for even
    const urlPosition = braceletPosition.toString().padStart(2, '0');
    const formatCode = totalCharCount % 2 === 1 ? 'O' : 'E'; // Same logic as letters
    
    // Use local images instead of dynamic Cloudinary URLs
    const braceletTypeName = braceletType.charAt(0).toUpperCase() + braceletType.slice(1); // Capitalize first letter
    return `/images/bracelets/${braceletType.toLowerCase()}/space/${braceletTypeName}-${urlPosition}-${formatCode}.png`;
  };

  const getLetterImagePath = (letter, letterPosition, totalCharCount, letterColor, isTrailingSpace = false) => {
    // Get centered positions for this word length
    const centeredPositions = getCenteredBraceletPositions(totalCharCount);
    const actualBraceletPosition = centeredPositions[letterPosition]; // letterPosition is 0-indexed
    
    // Handle spaces with position-specific stone images
    if (letter === ' ') {
      const selectedBracelet = getSelectedBracelet();
      return getSpaceStoneImagePath(selectedBracelet.id, actualBraceletPosition, totalCharCount);
    }
    
    // Convert to URL format (01, 02, 03, etc.)
    const urlPosition = actualBraceletPosition.toString().padStart(2, '0');
    
    // Map letter color to URL code
    const colorMap = {
      'white': 'WL',
      'pink': 'PK', 
      'black': 'BL',
      'gold': 'GL'
    };
    
    const colorCode = colorMap[letterColor] || 'WL'; // Default to white if color not found
    
    // Use O format for odd word lengths, E format for even word lengths
    const formatCode = totalCharCount % 2 === 1 ? 'O' : 'E'; // O for odd, E for even
    return `https://res.cloudinary.com/drvnwq9bm/image/upload/w_915,f_auto/customizer-v2/colors/${colorCode}/${letter.toUpperCase()}/${colorCode}-${letter.toUpperCase()}-${formatCode}-${urlPosition}.png`;
  };

  // Process word for display (handle spaces as stone separators)
  const processWordForDisplay = (word) => {
    if (!word) return [];
    
    // Split word into characters, maintaining spaces as separators
    return word.split('').map((char, index) => ({
      char: char,
      isSpace: char === ' ',
      index: index
    }));
  };

  // Calculate total price
  const calculateTotal = () => {
    const selectedBracelet = getSelectedBracelet();
    let total = selectedBracelet.basePrice;
    const selectedLetterColor = mockData.letterColors.find(c => c.id === customization.letterColor);
    if (selectedLetterColor) total += selectedLetterColor.price;
    const charmsTotal = customization.selectedCharms.reduce((sum, charm) => sum + charm.price, 0);
    return (total + charmsTotal) * quantity;
  };

  // Handle drag and drop functionality
  const handleDragStart = (e, item, itemType) => {
    console.log('Drag started with item:', item, 'type:', itemType);
    setDraggedItem({ item, itemType });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropzoneIndex) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Drop event triggered on dropzone:', dropzoneIndex, 'with draggedItem:', draggedItem);
    
    if (draggedItem && draggedItem.itemType === 'charm') {
      const charm = draggedItem.item;
      
      // Check if this dropzone already has a charm
      const existingCharmInDropzone = customization.selectedCharms.find(c => c.dropzoneIndex === dropzoneIndex);
      if (existingCharmInDropzone) {
        console.log('Dropzone already occupied');
        setDraggedItem(null);
        return;
      }
      
      // Add charm with dropzone position info
      const charmWithPosition = {
        ...charm,
        dropzoneIndex: dropzoneIndex,
        positionId: `dropzone-${dropzoneIndex}`
      };
      
      console.log('Adding charm to dropzone:', charmWithPosition);
      
      setCustomization({
        ...customization,
        selectedCharms: [...customization.selectedCharms, charmWithPosition]
      });
    }
    
    setDraggedItem(null);
  };

  const removeCharmFromDropzone = (charmId) => {
    setCustomization({
      ...customization,
      selectedCharms: customization.selectedCharms.filter(c => c.id !== charmId)
    });
  };

  // Helper function to generate charm position image path
  const getCharmPositionImagePath = (charmName, position) => {
    // Convert charm name to lowercase for folder name
    const folderName = charmName.toLowerCase();
    // Position should be 1-9 (left to right)
    const positionNumber = position + 1;
    return `/images/charms/${folderName}/${charmName.charAt(0).toUpperCase() + charmName.slice(1).toLowerCase()}_POS_${positionNumber.toString().padStart(2, '0')}.webp`;
  };

  return (
    <div className="App">
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '65% 35%', 
        gap: '0',
        minHeight: '100vh'
      }}>
        {/* Preview Panel */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: '#f9fafb',
          padding: '40px'
        }}>
          {/* Step Progress at top of preview */}
          <div style={{ marginBottom: '40px' }}>
            {/* Step circles with connecting lines */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px' }}>
              {steps.map((step, index) => (
                <React.Fragment key={step}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: `2px solid ${currentStep >= index + 1 ? '#4F46E5' : '#d1d5db'}`,
                    background: currentStep >= index + 1 ? '#4F46E5' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: currentStep >= index + 1 ? 'white' : '#9ca3af',
                    fontWeight: '600',
                    fontSize: '16px'
                  }}>
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div style={{
                      width: '60px',
                      height: '2px',
                      background: currentStep > index + 1 ? '#4F46E5' : '#d1d5db',
                      margin: '0 8px'
                    }} />
                  )}
                </React.Fragment>
              ))}
            </div>
            
            {/* Step name tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
              {steps.map((step, index) => (
                <div
                  key={step}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '500',
                    background: currentStep === index + 1 
                      ? (step === 'Design' ? '#fef3c7' : step === 'Word' ? '#e0e7ff' : '#ddd6fe')
                      : '#f3f4f6',
                    color: currentStep === index + 1 ? '#374151' : '#9ca3af'
                  }}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
          
          {/* Bracelet Preview - centered */}
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <div style={{ textAlign: 'center' }}>
              <div className="bracelet-preview-container">
                {/* Match Little Words Project structure exactly */}
                <div className="product-canvas">
                  <div className="product-overlapping">
                    {/* Main bracelet image - not background, but actual img element */}
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

                    {/* Main charm overlay */}
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
                    
                    {/* Charm dropzones - only show on step 3 */}
                    {currentStep === 3 && !isReviewMode && (
                      <div className="_productOverlappingDropzone_c850n_42" data-customizer-dropzone="true">
                        {[
                          { left: '18.5%', top: '70%' },  // Position 1 - leftmost
                          { left: '8%', top: '53%' },     // Position 2
                          { left: '10%', top: '33%' },    // Position 3
                          { left: '23%', top: '14%' },    // Position 4
                          { left: '46%', top: '7%' },     // Position 5 - top center
                          { left: '68%', top: '15%' },    // Position 6
                          { left: '82%', top: '33%' },    // Position 7
                          { left: '83%', top: '52.5%' },  // Position 8
                          { left: '73%', top: '69%' }     // Position 9 - rightmost
                        ].map((position, index) => {
                          const charmInThisDropzone = customization.selectedCharms.find(c => c.dropzoneIndex === index);
                          
                          return (
                            <div 
                              key={index}
                              className={`_dropzone_1xii1_43 ${!charmInThisDropzone ? '_dropzoneFull_1xii1_49' : ''}`}
                              style={{ 
                                left: position.left, 
                                top: position.top,
                                // Hide dropzone circle when charm is present
                                background: charmInThisDropzone ? 'transparent' : undefined,
                                boxShadow: charmInThisDropzone ? 'none' : undefined,
                                border: charmInThisDropzone ? 'none' : undefined
                              }}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, index)}
                            >
                              <div 
                                className="_magneticZone_1xii1_5"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, index)}
                              ></div>
                              
                              {/* Remove button and charm as children when charm is present */}
                              {charmInThisDropzone && (
                                <>
                                  <button 
                                    type="button" 
                                    className="_draggableInnerItemRemove_1xii1_36" 
                                    aria-label="Remove" 
                                    data-draggable-remove="true" 
                                    style={{ 
                                      top: '5px', 
                                      right: '-23px',
                                      position: 'absolute',
                                      background: 'none',
                                      border: 'none',
                                      cursor: 'pointer',
                                      width: '20px',
                                      height: '20px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                    onClick={() => removeCharmFromDropzone(charmInThisDropzone.id)}
                                  >
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em">
                                      <path d="m289.94 256 95-95A24 24 0 0 0 351 127l-95 95-95-95a24 24 0 0 0-34 34l95 95-95 95a24 24 0 1 0 34 34l95-95 95 95a24 24 0 0 0 34-34z"></path>
                                    </svg>
                                  </button>
                                  
                                  <div 
                                    className="_dragBox_fya8s_1 _draggableInnerItem_1xii1_16" 
                                    draggable="false" 
                                    data-original-scale="6" 
                                    data-draggable="false" 
                                    role="button" 
                                    tabIndex={0} 
                                    aria-disabled="false" 
                                    aria-roledescription="draggable" 
                                    style={{ 
                                      '--image-width': '700px', 
                                      '--image-height': '483px', 
                                      '--image-scale': '6', 
                                      '--center-width': '-50px', 
                                      right: '7%', 
                                      top: '35%', 
                                      opacity: 1,
                                      position: 'absolute'
                                    }}
                                  >
                                    <img 
                                      src={getCharmPositionImagePath(charmInThisDropzone.name, index)}
                                      alt={charmInThisDropzone.name} 
                                      loading="eager" 
                                      width="100%" 
                                      height="auto" 
                                      className="max-w-full h-full object-contain _draggableInnerItemImage_1xii1_23" 
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Letters and spaces container */}
                    <div className="product-overlapping-content">
                      {/* Each letter/space in its own div - only show for 2+ non-space characters */}
                      {customization.word && customization.word.replace(/\s/g, '').length >= 2 && (() => {
                        const totalCharCount = customization.word.length; // Include spaces in total count
                        let letterPosition = 0;
                        
                        return processWordForDisplay(customization.word).map((item, itemIndex) => {
                          // Check if this space is trailing (no non-space characters after it)
                          const isTrailingSpace = item.isSpace && 
                            !customization.word.slice(itemIndex + 1).replace(/\s/g, '').length;
                          
                          // Get pre-rendered letter/space image path
                          const imageImagePath = getLetterImagePath(
                            item.char, 
                            letterPosition, 
                            totalCharCount, 
                            customization.letterColor,
                            isTrailingSpace
                          );
                          const currentLetterPosition = letterPosition; // Store current position for z-index
                          letterPosition++; // Increment for all characters including spaces
                          
                          if (!imageImagePath) {
                            return null; // Skip if no image available
                          }
                          
                          // Each letter/space in its own div - matching LWP structure
                          return (
                            <div 
                              key={`${item.isSpace ? 'space' : 'letter'}-${itemIndex}`}
                              className="product-overlapping-letter"
                              style={{ zIndex: 20 - currentLetterPosition }} // Higher z-index for earlier letters
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
                        }).filter(Boolean); // Remove null entries
                      })()}
                    </div>
                  </div>

                  {/* Empty dropzones for letter positioning when no word is entered */}
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
              
              {/* Instruction text - only show on step 3 */}
              {currentStep === 3 && !isReviewMode && (
                <div style={{
                  marginTop: '20px',
                  fontSize: '14px',
                  color: '#ef4444',
                  textAlign: 'center'
                }}>
                  Drag & drop your charm to any highlighted spot.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Options Panel */}
        <div style={{
          backgroundColor: 'white',
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <div style={{ width: '80px' }}>
              {currentStep > 1 && (
                <button 
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    fontSize: '14px', 
                    cursor: 'pointer',
                    color: '#6b7280',
                    fontWeight: '500'
                  }}
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  ← {steps[currentStep - 2]}
                </button>
              )}
            </div>
            <div style={{ fontSize: '12px', fontWeight: '600', textAlign: 'center' }}>
              <div>little words</div>
              <div>project</div>
            </div>
            <button style={{ background: 'none', border: 'none', fontSize: '24px' }}>×</button>
          </div>

          {/* Content Area */}
          <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            {/* Step Content */}
            <div style={{ flex: 1 }}>
              {isReviewMode && (
                <div>
                  {/* Review Header */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '24px'
                  }}>
                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Your Custom Bracelet</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>Qty:</span>
                      <select
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                        style={{
                          padding: '4px 8px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      >
                        {[...Array(10)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Style Section */}
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Style</h3>
                      <button style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#4F46E5', 
                        fontSize: '14px',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                      onClick={() => {setIsReviewMode(false); setCurrentStep(1);}}>
                        Edit
                      </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        background: '#e5e7eb', 
                        borderRadius: '50%',
                        backgroundImage: `url(${getSelectedBracelet().image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}></div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '500' }}>{getSelectedBracelet().name}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Your Size: {customization.size.toUpperCase()}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: '12px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500', marginRight: '8px' }}>Size:</span>
                      {['XS', 'S/M', 'M/L', 'L/XL'].map(size => (
                        <button
                          key={size}
                          style={{
                            padding: '6px 12px',
                            margin: '0 4px',
                            border: `1px solid ${customization.size.toUpperCase() === size ? '#FFB6C1' : '#e5e7eb'}`,
                            borderRadius: '4px',
                            background: customization.size.toUpperCase() === size ? '#FFB6C1' : 'white',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                          onClick={() => setCustomization({...customization, size: size.toLowerCase()})}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Lettering Section */}
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Lettering</h3>
                      <button style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#4F46E5', 
                        fontSize: '14px',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                      onClick={() => {setIsReviewMode(false); setCurrentStep(2);}}>
                        Edit
                      </button>
                    </div>
                    <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                      <strong>Letter Color:</strong> {customization.letterColor.charAt(0).toUpperCase() + customization.letterColor.slice(1)}
                      {customization.letterColor === 'gold' && ' (+$15)'}
                    </div>
                    <div style={{ fontSize: '14px', marginBottom: '12px' }}>
                      <strong>Word:</strong> {customization.word}
                    </div>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      {customization.word.split('').map((letter, index) => (
                        <div key={index} style={{
                          width: '24px',
                          height: '24px',
                          background: '#e5e7eb',
                          borderRadius: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {letter}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Charms Section */}
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Charms ({customization.selectedCharms.length})</h3>
                      <button style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#4F46E5', 
                        fontSize: '14px',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                      onClick={() => {setIsReviewMode(false); setCurrentStep(3);}}>
                        {customization.selectedCharms.length > 0 ? 'Edit' : 'Add'}
                      </button>
                    </div>
                    {customization.selectedCharms.length > 0 ? (
                      Object.entries(
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
                          borderBottom: '1px solid #f3f4f6'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ 
                              width: '32px', 
                              height: '32px', 
                              background: '#e5e7eb', 
                              borderRadius: '8px',
                              backgroundImage: `url(${charmData.image})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center'
                            }}></div>
                            <div style={{ fontSize: '14px', fontWeight: '500' }}>{charmData.name}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '14px' }}>${charmData.price}</span>
                            <button 
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#4F46E5',
                                fontSize: '12px',
                                cursor: 'pointer',
                                textDecoration: 'underline'
                              }}
                              onClick={() => {
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
                      ))
                    ) : (
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#6b7280', 
                        fontStyle: 'italic',
                        padding: '12px 0'
                      }}>
                        No charms selected
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {!isReviewMode && currentStep === 1 && (
                <div>
                  {/* Category Navigation */}
                  <div style={{ marginBottom: '24px' }}>
                    <div 
                      className="category-scroll"
                      style={{
                        display: 'flex',
                        overflowX: 'auto',
                        gap: '8px',
                        paddingBottom: '8px'
                      }}>
                      {categories.map(category => (
                        <button
                          key={category}
                          style={{
                            padding: '12px 20px',
                            border: 'none',
                            borderRadius: '25px',
                            background: selectedCategory === category ? '#FFB6C1' : '#f8f9fa',
                            color: selectedCategory === category ? '#000' : '#6b7280',
                            fontFamily: 'Larsseit, -apple-system, BlinkMacSystemFont, sans-serif',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            transition: 'all 0.2s ease'
                          }}
                          onClick={() => setSelectedCategory(category)}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bracelet Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {braceletsByCategory[selectedCategory].map(bracelet => (
                      <button
                        key={bracelet.id}
                        style={{
                          padding: '16px',
                          border: `2px solid ${customization.braceletStyle === bracelet.id ? '#4F46E5' : '#f3f4f6'}`,
                          borderRadius: '8px',
                          background: 'white',
                          textAlign: 'center',
                          cursor: 'pointer',
                          position: 'relative'
                        }}
                        onClick={() => setCustomization({...customization, braceletStyle: bracelet.id})}
                      >
                        {bracelet.isBestSeller && (
                          <div style={{
                            position: 'absolute',
                            top: '4px',
                            left: '4px',
                            background: '#ef4444',
                            color: 'white',
                            fontSize: '8px',
                            fontWeight: '600',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            BEST SELLER
                          </div>
                        )}
                        <div style={{ 
                          width: '60px', 
                          height: '60px', 
                          background: '#e5e7eb', 
                          borderRadius: '50%', 
                          margin: '0 auto 8px',
                          backgroundImage: `url(${bracelet.image})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}></div>
                        <div style={{ fontSize: '12px', fontWeight: '500' }}>{bracelet.name}</div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>${bracelet.basePrice}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!isReviewMode && currentStep === 2 && (
                <div>
                  {/* Letter Color Section */}
                  <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '500' }}>Letter Color</h3>
                  <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', alignItems: 'flex-end' }}>
                    {mockData.letterColors.map(color => (
                      <div key={color.id} style={{ textAlign: 'center' }}>
                        <button
                          style={{
                            width: '64px',
                            height: '64px',
                            border: `3px solid ${customization.letterColor === color.id ? '#4F46E5' : 'transparent'}`,
                            borderRadius: '50%',
                            background: color.id === 'gold' 
                              ? `url('/images/gold-swatch.jpg') center/cover` 
                              : color.hexColor,
                            cursor: 'pointer',
                            display: 'block',
                            marginBottom: '8px',
                            padding: '0',
                            boxShadow: customization.letterColor === color.id ? '0 0 0 2px white, 0 0 0 5px #4F46E5' : '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                          onClick={() => setCustomization({...customization, letterColor: color.id})}
                        />
                        <div style={{ fontSize: '14px', fontWeight: '500' }}>
                          {color.name}
                          {color.price > 0 && <span style={{ fontSize: '14px' }}> (+{color.price})</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Enter Your Word Section */}
                  <h3 style={{ marginBottom: '16px' }}>Enter your word</h3>
                  <input
                    type="text"
                    value={customization.word}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      // Allow typing as long as characters are valid and within length limit
                      if (isValidCharacters(value)) {
                        setCustomization({...customization, word: value});
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '16px',
                      border: `2px solid ${isValidWord(customization.word) ? '#e5e7eb' : '#ef4444'}`,
                      borderRadius: '8px',
                      fontSize: '16px',
                      textAlign: 'left',
                      marginBottom: '8px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="LET THEM"
                    maxLength="13"
                  />
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#9ca3af', 
                    marginBottom: '24px',
                    lineHeight: '1.4'
                  }}>
                    13 characters maximum, minimum 2. Letter, number, :), &lt;3, !, #, &amp;, and : characters only.
                  </div>
                  
                  {/* Trending Words Section */}
                  <h4 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>Trending Words</h4>
                  <div 
                    className="category-scroll"
                    style={{
                      display: 'flex',
                      overflowX: 'auto',
                      gap: '8px',
                      paddingBottom: '8px'
                    }}
                  >
                    {trendingWords.map(word => (
                      <button
                        key={word}
                        style={{
                          padding: '12px 20px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '25px',
                          background: 'white',
                          color: '#374151',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => setCustomization({...customization, word: word})}
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!isReviewMode && currentStep === 3 && (
                <div>
                  {/* Header */}
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ margin: 0, marginBottom: '4px' }}>Charms <span style={{ fontWeight: '400', color: '#9ca3af' }}>(Optional Add On)</span></h3>
                  </div>

                  {/* Search Bar */}
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

                  {/* Category Navigation */}
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

                  {/* Charms Grid */}
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
                              setCustomization({
                                ...customization,
                                selectedCharms: [...customization.selectedCharms, charm]
                              });
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

                  {/* Selected Charms Summary */}
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
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ 
            position: 'sticky', 
            bottom: 0, 
            padding: '20px 24px', 
            borderTop: '1px solid #f0f0f0',
            backgroundColor: 'white',
            marginTop: 'auto'
          }}>
            <button
              style={{
                width: '100%',
                background: (currentStep === 2 && (!customization.word || customization.word.trim().length < 2)) 
                  ? '#9ca3af' 
                  : '#4F46E5',
                color: 'white',
                border: 'none',
                padding: '16px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: (currentStep === 2 && (!customization.word || customization.word.trim().length < 2)) 
                  ? 'not-allowed' 
                  : 'pointer'
              }}
              disabled={currentStep === 2 && (!customization.word || customization.word.trim().length < 2)}
              onClick={() => {
                if (isReviewMode) {
                  alert(`Add to Cart $${calculateTotal()}`);
                } else if (currentStep < 3) {
                  // Don't advance to step 3 if on step 2 and word is invalid
                  if (currentStep === 2 && (!customization.word || customization.word.trim().length < 2)) {
                    return;
                  }
                  setCurrentStep(currentStep + 1);
                } else {
                  setIsReviewMode(true);
                }
              }}
            >
              {isReviewMode ? `ADD TO CART $${calculateTotal()}` : (currentStep < 3 ? 'NEXT' : 'REVIEW')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;