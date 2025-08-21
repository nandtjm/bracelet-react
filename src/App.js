import React, { useState, useEffect } from 'react';
import './App.css';
import mockData from './data/mockData.json';
import BraceletPreview from './components/BraceletPreview';
import StepNavigation from './components/StepNavigation';
import DesignStep from './components/DesignStep';
import WordStep from './components/WordStep';
import CharmsStep from './components/CharmsStep';
import useWordPressIntegration from './hooks/useWordPressIntegration';

function App() {
  // WordPress integration
  const { isWordPressMode, isModalMode, initialProductId, getImageUrl, addToCart, closeModal, fetchBracelets, fetchCharms, formatPrice, wpData } = useWordPressIntegration();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('mockdata');
  const [bracelets, setBracelets] = useState([]);
  const [charms, setCharms] = useState([]);
  const [customization, setCustomization] = useState({
    braceletStyle: 'bluestone',
    word: '', // Ensure word starts empty
    letterColor: 'white',
    selectedCharms: [],
    size: 'xs'
  });
  const [selectedCategory, setSelectedCategory] = useState('Standard');

  const steps = ['Design', 'Word', 'Charms'];
  // Predefined categories (always show these categories)
  const predefinedCategories = ['All', 'Standard', 'Collabs', 'Limited Edition', 'Engraving', 'Tiny Words'];
  
  // Dynamic categories from data
  const dynamicCategories = loading ? [] : ['All', ...new Set(bracelets.map(b => b.category))].map(cat => 
    cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')
  );
  
  // Merge predefined and dynamic categories, remove duplicates
  const categories = loading ? [] : [...new Set([...predefinedCategories, ...dynamicCategories])];
  const trendingWords = mockData.trendingWords; // Keep trending words from mock data
  const charmCategories = loading ? [] : ['All', ...new Set(charms.map(c => c.category))].map(cat => 
    cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')
  );
  
  const [selectedCharmCategory, setSelectedCharmCategory] = useState('All');
  const [charmSearchQuery, setCharmSearchQuery] = useState('');
  const [isCharmSummaryExpanded, setIsCharmSummaryExpanded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [hoveredCharm, setHoveredCharm] = useState(null);
  const [charmImageDimensions, setCharmImageDimensions] = useState({});
  const [isDragInProgress, setIsDragInProgress] = useState(false);
  
  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        if (isWordPressMode) {
          // Fetch from WordPress API
          const [braceletsResponse, charmsResponse] = await Promise.all([
            fetchBracelets(),
            fetchCharms()
          ]);
          
          if (braceletsResponse && braceletsResponse.data) {
            setBracelets(braceletsResponse.data);
            setDataSource(braceletsResponse.source || 'woocommerce');
          } else {
            // Fallback to mock data
            setBracelets(mockData.bracelets);
            setDataSource('mockdata_fallback');
          }
          
          if (charmsResponse && charmsResponse.data) {
            setCharms(charmsResponse.data);
          } else {
            // Fallback to mock data
            setCharms(mockData.charms);
          }
        } else {
          // Standalone mode - use mock data
          setBracelets(mockData.bracelets);
          setCharms(mockData.charms);
          setDataSource('mockdata');
        }
      } catch (error) {
        // console.error('Error loading data:', error);
        // Fallback to mock data on error
        setBracelets(mockData.bracelets);
        setCharms(mockData.charms);
        setDataSource('mockdata_error');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [isWordPressMode]); // Removed fetchBracelets, fetchCharms from deps to prevent infinite loop
  
  // Debug bracelet data when loaded
  useEffect(() => {
    if (bracelets.length > 0) {
      console.log(`Bracelets loaded: ${bracelets.length}, source: ${dataSource}`);
      const selectedBracelet = getSelectedBracelet();
      if (selectedBracelet) {
        console.log('Selected bracelet:', selectedBracelet.id);
        console.log('Space stone images available:', selectedBracelet.spaceStoneImages ? Object.keys(selectedBracelet.spaceStoneImages).length : 0);
        if (selectedBracelet.spaceStoneImages) {
          console.log('Space stone keys:', Object.keys(selectedBracelet.spaceStoneImages));
        }
      }
    }
  }, [bracelets, customization.braceletStyle]);
  
  // Auto-select product when data is loaded and we have an initialProductId
  useEffect(() => {
    if (!loading && initialProductId && bracelets.length > 0) {
      // Find the bracelet by WooCommerce ID
      const targetBracelet = bracelets.find(bracelet => 
        bracelet.woocommerce_id === initialProductId || 
        bracelet.id === initialProductId.toString()
      );
      
      if (targetBracelet) {
        setCustomization(prev => ({
          ...prev,
          braceletStyle: targetBracelet.id
        }));
      }
    }
  }, [loading, initialProductId, bracelets]);
  
  // Organize bracelets by category
  const braceletsByCategory = {
    'All': bracelets,
    'Standard': bracelets.filter(b => b.category === 'standard'),
    'Collabs': bracelets.filter(b => b.category === 'collabs'),
    'Limited Edition': bracelets.filter(b => b.category === 'limited-edition'),
    'Engraving': bracelets.filter(b => b.category === 'engraving'),
    'Tiny Words': bracelets.filter(b => b.category === 'tiny-words')
  };

  // Organize charms by category
  const charmsByCategory = {
    'All': charms,
    'Bestsellers': charms.filter(c => c.category === 'bestsellers'),
    'New Drops & Favs': charms.filter(c => c.category === 'new-drops' || c.category === 'new-drops-favs'),
    'Personalize it': charms.filter(c => c.category === 'personalize-it')
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
    return bracelets.find(b => b.id === customization.braceletStyle) || bracelets[0] || mockData.bracelets[0];
  };

  // Get the appropriate bracelet image based on word character count
  const getBraceletImage = () => {
    const selectedBracelet = getSelectedBracelet();
    
    if (!customization.word || customization.word.length === 0) {
      return getImageUrl(selectedBracelet.image); // No gaps image
    }
    
    // Count all characters including spaces for bracelet variant selection
    const totalCharCount = customization.word.length;
    
    // Only show gap images if there are at least 2 non-space characters
    const nonSpaceCharCount = customization.word.replace(/\s/g, '').length;
    if (nonSpaceCharCount < 2) {
      return getImageUrl(selectedBracelet.image);
    }
    
    // Use appropriate gap image based on total character count including spaces (2-13)
    if (totalCharCount >= 2 && totalCharCount <= 13 && selectedBracelet.gapImages) {
      const gapImage = selectedBracelet.gapImages[totalCharCount.toString()] || selectedBracelet.image;
      return getImageUrl(gapImage);
    }
    
    return getImageUrl(selectedBracelet.image);
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
    const selectedBracelet = getSelectedBracelet();
    
    // Debug logging
    console.log(`getSpaceStoneImagePath: braceletType=${braceletType}, braceletPosition=${braceletPosition}, totalCharCount=${totalCharCount}`);
    
    // Use space stone images from the API if available
    if (selectedBracelet && selectedBracelet.spaceStoneImages) {
      const urlPosition = braceletPosition.toString().padStart(2, '0');
      const formatCode = totalCharCount % 2 === 1 ? 'O' : 'E'; // O for odd word length, E for even word length
      const stoneKey = `${urlPosition}_${formatCode}`;
      
      console.log(`Space stone lookup: key=${stoneKey}, found=${!!selectedBracelet.spaceStoneImages[stoneKey]}`);
      console.log('Available space stone keys:', Object.keys(selectedBracelet.spaceStoneImages));
      if (selectedBracelet.spaceStoneImages[stoneKey]) {
        console.log(`Using WordPress space stone: ${selectedBracelet.spaceStoneImages[stoneKey]}`);
        return selectedBracelet.spaceStoneImages[stoneKey];
      } else {
        console.log(`Space stone not found for key ${stoneKey}, falling back to constructed path`);
      }
    } else {
      console.log('No spaceStoneImages data available from WordPress API');
    }
    
    // Fallback to constructed path if no API data available
    const urlPosition = braceletPosition.toString().padStart(2, '0');
    const formatCode = totalCharCount % 2 === 1 ? 'O' : 'E'; // O for odd word length, E for even word length
    const braceletTypeName = braceletType.charAt(0).toUpperCase() + braceletType.slice(1);
    const imagePath = `images/bracelets/${braceletType.toLowerCase()}/space/${braceletTypeName}-${urlPosition}-${formatCode}.png`;
    return getImageUrl(imagePath);
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
    const formatCode = totalCharCount % 2 === 1 ? 'O' : 'E'; // O for odd word length, E for even word length
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

  // Get letter colors from WordPress data or fallback to mock data
  const getLetterColors = () => {
    if (isWordPressMode && wpData?.letterColors) {
      return wpData.letterColors;
    }
    return mockData.letterColors;
  };

  // Calculate total price
  const calculateTotal = () => {
    const selectedBracelet = getSelectedBracelet();
    let total = selectedBracelet.basePrice;
    const letterColors = getLetterColors();
    const selectedLetterColor = letterColors.find(c => c.id === customization.letterColor);
    if (selectedLetterColor) total += selectedLetterColor.price;
    const charmsTotal = customization.selectedCharms.reduce((sum, charm) => sum + charm.price, 0);
    return (total + charmsTotal) * quantity;
  };

  // Handle drag and drop functionality
  const handleDragStart = (e, item, itemType) => {
    // console.log('Drag started with item:', item, 'type:', itemType);
    const dragData = { item, itemType };
    // console.log('Setting draggedItem to:', dragData);
    setDraggedItem(dragData);
    setIsDragInProgress(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropzoneIndex) => {
    e.preventDefault();
    e.stopPropagation();
    
    // console.log('Drop event triggered on dropzone:', dropzoneIndex, 'with draggedItem:', draggedItem);
    
    // Fallback: try to get data from dataTransfer if draggedItem is null
    let currentDraggedItem = draggedItem;
    if (!currentDraggedItem) {
      try {
        const transferData = e.dataTransfer.getData('text/plain');
        if (transferData) {
          currentDraggedItem = JSON.parse(transferData);
          // console.log('Retrieved draggedItem from dataTransfer:', currentDraggedItem);
        }
      } catch (error) {
        // console.log('Failed to parse dataTransfer data:', error);
      }
    }
    
    if (currentDraggedItem && (currentDraggedItem.itemType === 'charm' || currentDraggedItem.itemType === 'placed-charm')) {
      const charm = currentDraggedItem.item;
      
      // Check if this dropzone already has a charm
      const existingCharmInDropzone = customization.selectedCharms.find(c => c.dropzoneIndex === dropzoneIndex);
      if (existingCharmInDropzone) {
        // console.log('Dropzone already occupied');
        setDraggedItem(null);
        return;
      }
      
      if (currentDraggedItem.itemType === 'placed-charm') {
        // Moving an existing charm from one dropzone to another
        const updatedCharms = customization.selectedCharms.map(c => {
          if (c.id === charm.id && c.dropzoneIndex === charm.currentDropzoneIndex) {
            return {
              ...c,
              dropzoneIndex: dropzoneIndex,
              positionId: `dropzone-${dropzoneIndex}`
            };
          }
          return c;
        });
        
        // console.log('Moving charm to new dropzone:', dropzoneIndex);
        
        setCustomization({
          ...customization,
          selectedCharms: updatedCharms
        });
      } else {
        // Adding a new charm from the selection grid
        const charmWithPosition = {
          ...charm,
          dropzoneIndex: dropzoneIndex,
          positionId: `dropzone-${dropzoneIndex}`
        };
        
        // console.log('Adding charm to dropzone:', charmWithPosition);
        
        setCustomization({
          ...customization,
          selectedCharms: [...customization.selectedCharms, charmWithPosition]
        });
      }
    }
    
    setDraggedItem(null);
    setIsDragInProgress(false);
  };

  const removeCharmFromDropzone = (charmId, dropzoneIndex) => {
    setCustomization({
      ...customization,
      selectedCharms: customization.selectedCharms.filter(c => !(c.id === charmId && c.dropzoneIndex === dropzoneIndex))
    });
  };

  // Helper function to generate charm position image path
  const getCharmPositionImagePath = (charmName, position) => {
    // Find the charm in our data to get position images
    const charm = charms.find(c => c.name === charmName || c.id === charmName);
    if (charm && charm.positionImages && charm.positionImages[position + 1]) {
      // Use position image from WooCommerce if available
      return charm.positionImages[position + 1];
    }
    
    // Fallback to constructed path for backward compatibility
    const folderName = charmName.toLowerCase();
    const positionNumber = position + 1;
    const imagePath = `images/charms/${folderName}/${charmName.charAt(0).toUpperCase() + charmName.slice(1).toLowerCase()}_POS_${positionNumber.toString().padStart(2, '0')}.webp`;
    return getImageUrl(imagePath);
  };

  // Helper function to get position-specific charm styles (only position values)
  const getCharmPositionStyles = (position) => {
    const positionStyles = [
      // Position 1
      {
        top: '18%',
        left: '-75%',
        opacity: 1
      },
      // Position 2
      {
        right: '7%',
        top: '35%',
        opacity: 1
      },
      // Position 3
      {
        right: '15%',
        top: '-8%',
        opacity: 1
      },
      // Position 4
      {
        bottom: '8%',
        left: '-40%',
        opacity: 1
      },
      // Position 5
      {
        left: '12%',
        bottom: '3%',
        opacity: 1
      },
      // Position 6 (mirrored from position 4)
      {
        bottom: '8%',
        right: '-40%',
        opacity: 1
      },
      // Position 7 (mirrored from position 3)
      {
        left: '15%',
        top: '-8%',
        opacity: 1
      },
      // Position 8 (mirrored from position 2)
      {
        left: '7%',
        top: '35%',
        opacity: 1
      },
      // Position 9 (mirrored from position 1)
      {
        top: '18%',
        right: '-75%',
        opacity: 1
      }
    ];
    
    return positionStyles[position] || {};
  };

  // Helper function to get manual close button position based on charm position
  const getCloseButtonPosition = (position) => {
    // Manual positioning for each charm dropzone (0-indexed)
    const manualPositions = [
      { top: '-21px', right: '-12px' },    // Position 0 (charm position 1)
      { top: '5px', right: '-23px' },      // Position 1 (charm position 2)
      { bottom: '10px', right: '-25px' },  // Position 2 (charm position 3)
      { bottom: '-22px', right: '-10px' }, // Position 3 (charm position 4)
      { bottom: '-28px', left: '8px' },    // Position 4 (charm position 5)
      { bottom: '-24px' },                 // Position 5 (charm position 6)
      { top: '20px', left: '-25px' },      // Position 6 (charm position 7)
      { top: '0px', left: '-24px' },       // Position 7 (charm position 8)
      { top: '-15px', left: '-15px' }      // Position 8 (charm position 9)
    ];
    
    return manualPositions[position] || { top: '-21px', right: '-12px' };
  };

  // Helper function to get dynamic image dimensions
  // Load image dimensions when charms are added
  useEffect(() => {
    // Prevent infinite loops by checking if charms data is loaded
    if (charms.length === 0) return;
    
    customization.selectedCharms.forEach(charm => {
      if (charm.dropzoneIndex !== undefined) {
        const charmKey = `${charm.id}-${charm.dropzoneIndex}`;
        
        // Only load if not already loaded and not currently loading
        if (!charmImageDimensions[charmKey]) {
          const imagePath = getCharmPositionImagePath(charm.name, charm.dropzoneIndex);
          
          // Prevent duplicate loading
          if (imagePath) {
            const img = new Image();
            img.onload = () => {
              const width = img.naturalWidth;
              const height = img.naturalHeight;
              const scale = 6;
              const centerWidth = -(width / scale / 2);
              
              setCharmImageDimensions(prev => {
                // Double-check to prevent race conditions
                if (prev[charmKey]) return prev;
                
                return {
                  ...prev,
                  [charmKey]: {
                    '--image-width': `${width}px`,
                    '--image-height': `${height}px`,
                    '--image-scale': scale.toString(),
                    '--center-width': `${centerWidth}px`
                  }
                };
              });
            };
            img.onerror = () => {
              // Mark as failed to prevent retry loops
              setCharmImageDimensions(prev => ({
                ...prev,
                [charmKey]: null
              }));
            };
            img.src = imagePath;
          }
        }
      }
    });
  }, [customization.selectedCharms]); // Removed charms dependency to prevent infinite loop

  if (loading) {
    return (
      <div className="App" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            marginBottom: '12px',
            color: '#374151'
          }}>
            Loading Bracelet Customizer...
          </div>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #4F46E5',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {/* Data source indicator (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: dataSource === 'woocommerce' ? '#10b981' : '#f59e0b',
          color: 'white',
          padding: '4px 8px',
          fontSize: '12px',
          borderRadius: '4px',
          zIndex: 9999
        }}>
          Data: {dataSource}
        </div>
      )}
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '65% 35%', 
        gap: '0',
        height: '100vh',
        minHeight: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden'
      }}>
        {/* Preview Panel */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: '#f9fafb',
          padding: '40px'
        }}>
          <StepNavigation currentStep={currentStep} steps={steps} />
          
          <BraceletPreview
            customization={customization}
            currentStep={currentStep}
            isReviewMode={isReviewMode}
            getBraceletImage={getBraceletImage}
            processWordForDisplay={processWordForDisplay}
            getLetterImagePath={getLetterImagePath}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            removeCharmFromDropzone={removeCharmFromDropzone}
            getCharmPositionImagePath={getCharmPositionImagePath}
            getCharmPositionStyles={getCharmPositionStyles}
            charmImageDimensions={charmImageDimensions}
            handleDragStart={handleDragStart}
            getCloseButtonPosition={getCloseButtonPosition}
            isDragInProgress={isDragInProgress}
            setIsDragInProgress={setIsDragInProgress}
            selectedBracelet={getSelectedBracelet()}
            getImageUrl={getImageUrl}
          />
        </div>

        {/* Options Panel */}
        <div style={{
          backgroundColor: 'white',
          height: '100vh',
          minHeight: '100vh',
          maxHeight: '100vh',
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
              {(currentStep > 1 || isReviewMode) && (
                <button 
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    fontSize: '14px', 
                    cursor: 'pointer',
                    color: '#6b7280',
                    fontWeight: '500'
                  }}
                  onClick={() => {
                    if (isReviewMode) {
                      setIsReviewMode(false);
                      setCurrentStep(3); // Go back to Charms step
                    } else {
                      setCurrentStep(currentStep - 1);
                    }
                  }}
                >
                  ← {isReviewMode ? 'Charms' : steps[currentStep - 2]}
                </button>
              )}
            </div>
            <div style={{ fontSize: '12px', fontWeight: '600', textAlign: 'center' }}>
              <div>little words</div>
              <div>project</div>
            </div>
            <button 
              style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
              onClick={() => {
                if (isWordPressMode) {
                  closeModal();
                } else {
                  // Standalone mode - could close or hide the app
                  // console.log('Close button clicked in standalone mode');
                }
              }}
            >
              ×
            </button>
          </div>

          {/* Content Area */}
          <div style={{ 
            padding: '24px', 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            overflowY: 'auto',
            minHeight: 0  // Important for flex child to be scrollable
          }}>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ 
                        width: '80px', 
                        height: '80px', 
                        background: '#e5e7eb', 
                        borderRadius: '50%',
                        backgroundImage: `url(${getImageUrl(getSelectedBracelet().image)})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        flexShrink: 0
                      }}></div>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{getSelectedBracelet().name}</div>
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>Your Size: {customization.size.toUpperCase()}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: '12px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500', marginRight: '8px' }}>Size:</span>
                      {(getSelectedBracelet().availableSizes || ['XS', 'S/M', 'M/L', 'L/XL']).map(size => (
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
                      {(() => {
                        const letterColors = getLetterColors();
                        const selectedLetterColor = letterColors.find(c => c.id === customization.letterColor);
                        return selectedLetterColor && selectedLetterColor.price > 0 ? ` (+${formatPrice(selectedLetterColor.price)})` : '';
                      })()}
                    </div>
                    <div style={{ fontSize: '14px', marginBottom: '12px' }}>
                      <strong>Word:</strong> {customization.word}
                    </div>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      {customization.word.split('').map((letter, index) => {
                        // Map letter color to URL code
                        const colorMap = {
                          'white': 'WL',
                          'pink': 'PK', 
                          'black': 'BL',
                          'gold': 'GL'
                        };
                        
                        const colorCode = colorMap[customization.letterColor] || 'WL';
                        
                        // Handle spaces - show empty space
                        if (letter === ' ') {
                          return (
                            <div key={index} style={{
                              width: '24px',
                              height: '24px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {/* Empty space for actual space character */}
                            </div>
                          );
                        }
                        
                        // Generate static letter block URL
                        const letterImageUrl = `https://res.cloudinary.com/drvnwq9bm/image/upload/f_auto,q_auto,w_90/customizer-v2/types/statics/${colorCode}/${letter.toUpperCase()}.png`;
                        
                        return (
                          <div key={index} style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                          }}>
                            <img 
                              src={letterImageUrl}
                              alt={letter}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain'
                              }}
                              onError={(e) => {
                                // Fallback to text if image fails to load
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = `<div style="width: 24px; height: 24px; background: #e5e7eb; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600;">${letter}</div>`;
                              }}
                            />
                          </div>
                        );
                      })}
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
                      customization.selectedCharms.map((charm, index) => (
                        <div key={`review-charm-${charm.id}-${charm.dropzoneIndex}-${index}`} style={{
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
                              backgroundImage: `url(${getImageUrl(charm.image)})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center'
                            }}></div>
                            <div style={{ fontSize: '14px', fontWeight: '500' }}>{charm.name}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '14px' }}>{formatPrice(charm.price)}</span>
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
                                const updatedCharms = customization.selectedCharms.filter((c, i) => i !== index);
                                setCustomization({
                                  ...customization,
                                  selectedCharms: updatedCharms
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
                <DesignStep
                  categories={categories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  braceletsByCategory={braceletsByCategory}
                  customization={customization}
                  setCustomization={setCustomization}
                  formatPrice={formatPrice}
                />
              )}

              {!isReviewMode && currentStep === 2 && (
                <WordStep
                  mockData={mockData}
                  customization={customization}
                  setCustomization={setCustomization}
                  isValidCharacters={isValidCharacters}
                  isValidWord={isValidWord}
                  trendingWords={trendingWords}
                  getImageUrl={getImageUrl}
                  letterColors={getLetterColors()}
                  formatPrice={formatPrice}
                />
              )}

              {!isReviewMode && currentStep === 3 && (
                <CharmsStep
                  charmCategories={charmCategories}
                  selectedCharmCategory={selectedCharmCategory}
                  setSelectedCharmCategory={setSelectedCharmCategory}
                  charmSearchQuery={charmSearchQuery}
                  setCharmSearchQuery={setCharmSearchQuery}
                  charmsByCategory={charmsByCategory}
                  customization={customization}
                  setCustomization={setCustomization}
                  hoveredCharm={hoveredCharm}
                  setHoveredCharm={setHoveredCharm}
                  handleDragStart={handleDragStart}
                  isCharmSummaryExpanded={isCharmSummaryExpanded}
                  setIsCharmSummaryExpanded={setIsCharmSummaryExpanded}
                  setIsDragInProgress={setIsDragInProgress}
                  formatPrice={formatPrice}
                />
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
            {currentStep === 3 && !isReviewMode ? (
              // Step 3: Split layout with Your Charms on left, REVIEW button on right
              <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}>
                {/* Your Charms Section */}
                <div style={{ 
                  flex: 1,
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
                onClick={() => setIsCharmSummaryExpanded(!isCharmSummaryExpanded)}>
                  <span style={{ 
                    fontSize: '16px', 
                    fontWeight: '600',
                    color: '#111827'
                  }}>
                    Your Charms ({customization.selectedCharms.length})
                  </span>
                  <div style={{ 
                    transform: isCharmSummaryExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    color: '#6b7280',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6,9 12,15 18,9"></polyline>
                    </svg>
                  </div>
                </div>
                
                {/* REVIEW Button */}
                <button
                  style={{
                    background: '#4F46E5',
                    color: 'white',
                    border: 'none',
                    padding: '16px 32px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '16px',
                    minWidth: '120px'
                  }}
                  onClick={() => setIsReviewMode(true)}
                >
                  REVIEW
                </button>
              </div>
            ) : (
              // Other steps: Full width button
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
                onClick={async () => {
                  if (isReviewMode) {
                    if (isWordPressMode) {
                      // WordPress mode - add to WooCommerce cart
                      const selectedBracelet = getSelectedBracelet();
                      const productData = {
                        product_id: selectedBracelet.woocommerce_id || selectedBracelet.id,
                        quantity: quantity,
                        variation_data: {
                          bracelet_style: customization.braceletStyle,
                          letter_color: customization.letterColor,
                          size: customization.size
                        }
                      };
                      
                      const customizationData = {
                        bracelet_style: customization.braceletStyle,
                        word: customization.word,
                        letter_color: customization.letterColor,
                        selected_charms: customization.selectedCharms,
                        size: customization.size,
                        quantity: quantity,
                        total_price: calculateTotal()
                      };
                      
                      const result = await addToCart(productData, customizationData);
                      if (result) {
                        // Success - could show notification or redirect
                        // console.log('Added to cart successfully', result);
                        closeModal(); // Close the customizer
                      } else {
                        alert('Error adding to cart. Please try again.');
                      }
                    } else {
                      // Standalone mode - show alert
                      alert(`Add to Cart ${formatPrice(calculateTotal())}`);
                    }
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
                {isReviewMode ? `ADD TO CART ${formatPrice(calculateTotal())}` : (currentStep < 3 ? 'NEXT' : 'REVIEW')}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Expandable Charms Summary Overlay */}
      {currentStep === 3 && !isReviewMode && isCharmSummaryExpanded && customization.selectedCharms.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          right: '24px',
          left: '65%',
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          <div style={{ 
            padding: '16px',
            borderBottom: '1px solid #f3f4f6',
            background: '#f8f9fa',
            borderRadius: '8px 8px 0 0'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center'
            }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                Your Charms ({customization.selectedCharms.length})
              </h4>
              <button
                onClick={() => setIsCharmSummaryExpanded(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>
          </div>
          
          <div style={{ padding: '16px' }}>
            {customization.selectedCharms.map((charm, index) => (
              <div key={`${charm.id}-${charm.dropzoneIndex}-${index}`} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: '1px solid #f3f4f6'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    background: '#e5e7eb', 
                    borderRadius: '6px',
                    backgroundImage: `url(${getImageUrl(charm.image)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}></div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>{charm.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{formatPrice(charm.price)}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      const updatedCharms = customization.selectedCharms.filter((c, i) => i !== index);
                      setCustomization({
                        ...customization,
                        selectedCharms: updatedCharms
                      });
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;