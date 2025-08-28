import React, { useState, useEffect } from 'react';
import './App.css';
import mockData from './data/mockData.json';
import BraceletPreview from './components/BraceletPreview';
import StepNavigation from './components/StepNavigation';
import DesignStep from './components/DesignStep';
import WordStep from './components/WordStep';
import CharmsStep from './components/CharmsStep';
import MobileLayout from './components/MobileLayout';
import CustomDndProvider from './components/DndProvider';
import useWordPressIntegration from './hooks/useWordPressIntegration';
import { toPng } from 'html-to-image';

function App() {
  // WordPress integration
  const { isWordPressMode, isModalMode, initialProductId, getImageUrl, addToCart, closeModal, fetchBracelets, fetchCharms, formatPrice, wpData, uploadScreenshotImage } = useWordPressIntegration();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('mockdata');
  const [bracelets, setBracelets] = useState([]);
  const [charms, setCharms] = useState([]);
  const [charmCategoriesMap, setCharmCategoriesMap] = useState({});
  const [customization, setCustomization] = useState({
    braceletStyle: 'bluestone',
    word: '', // Ensure word starts empty
    letterColor: 'white',
    selectedCharms: [],
    size: 'xs'
  });
  
  // State to store captured screenshot for review page
  const [capturedScreenshot, setCapturedScreenshot] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Dynamic step control helper
  const getStepsConfig = () => {
    if (bracelets.length === 0) return { steps: ['Chains', 'Word', 'Charms'], maxSteps: 3 }; // Default while loading
    const selectedBracelet = bracelets.find(b => b.id === customization.braceletStyle) || bracelets[0];
    
    // Check product category to determine which steps to show
    const isNoWords = selectedBracelet?.category === 'No Words';
    const isTinyWords = selectedBracelet?.category === 'Tiny Words';
    
    if (isNoWords) {
      // No words products: skip letter step, keep charm step
      return { steps: ['Chains', 'Charms'], maxSteps: 2 };
    } else if (isTinyWords) {
      // Tiny words products: show letter step, skip charm step
      return { steps: ['Chains', 'Word'], maxSteps: 2 };
    } else {
      // All other products: show all steps
      return { steps: ['Chains', 'Word', 'Charms'], maxSteps: 3 };
    }
  };
  
  const stepsConfig = getStepsConfig();
  const steps = stepsConfig.steps;
  const maxSteps = stepsConfig.maxSteps;
  
  // Dynamic categories from WooCommerce API data
  const categories = loading ? [] : ['All', ...new Set(bracelets.map(b => b.category))];
  const trendingWords = mockData.trendingWords; // Keep trending words from mock data
  const charmCategories = loading ? [] : (() => {
    const categorySet = new Set(['All']);
    
    // Add display names from the categories map (from API response)
    if (charmCategoriesMap && Object.keys(charmCategoriesMap).length > 0) {
      Object.values(charmCategoriesMap).forEach(displayName => {
        categorySet.add(displayName);
      });
    } else {
      // Fallback: extract categories from charms and format them
      charms.forEach(charm => {
        if (charm.category) {
          const formattedCategory = charm.category.charAt(0).toUpperCase() + charm.category.slice(1).replace('-', ' ');
          categorySet.add(formattedCategory);
        }
      });
    }
    
    return Array.from(categorySet);
  })();
  
  const [selectedCharmCategory, setSelectedCharmCategory] = useState('All');
  const [charmSearchQuery, setCharmSearchQuery] = useState('');
  const [isCharmSummaryExpanded, setIsCharmSummaryExpanded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [hoveredCharm, setHoveredCharm] = useState(null);
  const [charmImageDimensions, setCharmImageDimensions] = useState({});
  const [isDragInProgress, setIsDragInProgress] = useState(false);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(window.innerWidth <= 1024);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobileOrTablet(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        console.log('App - isWordPressMode:', isWordPressMode);
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
            // Store categories mapping from API response
            if (charmsResponse.categories) {
              setCharmCategoriesMap(charmsResponse.categories);
            }
          } else {
            // Fallback to mock data
            setCharms(mockData.charms);
            setCharmCategoriesMap({});
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
        console.log('Selected bracelet all:', selectedBracelet);
        console.log('Selected bracelet:', selectedBracelet.id);
        console.log('Selected bracelet category:', selectedBracelet.category);
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
      console.log('Attempting to auto-select product with ID:', initialProductId);
      console.log('Available bracelets:', bracelets.map(b => ({ id: b.id, woocommerce_id: b.woocommerce_id, name: b.name })));
      
      // Find the bracelet by WooCommerce ID (prioritize this since it's the actual product ID)
      const targetBracelet = bracelets.find(bracelet => 
        bracelet.woocommerce_id == initialProductId ||  // Use == to handle string/int comparison
        bracelet.id === initialProductId.toString()
      );
      
      if (targetBracelet) {
        console.log('Found matching bracelet:', targetBracelet);
        setCustomization(prev => ({
          ...prev,
          braceletStyle: targetBracelet.id
        }));
        
        // Set the category to match the selected product
        if (targetBracelet.category === 'Collabs') {
          setSelectedCategory('Collabs');
        } else if (targetBracelet.category === 'Standard') {
          setSelectedCategory('Standard');
        } else if (targetBracelet.category === 'Tiny Words') {
          setSelectedCategory('Tiny Words');
        } else if (targetBracelet.category === 'No Words') {
          setSelectedCategory('No Words');
        }
      } else {
        console.log('No matching bracelet found for product ID:', initialProductId);
      }
    }
  }, [loading, initialProductId, bracelets]);
  
  // Reset step when switching between product types with different step configurations
  useEffect(() => {
    if (currentStep > maxSteps) {
      setCurrentStep(maxSteps);
    }
  }, [maxSteps, currentStep]);
  
  // Auto-select first letter color when bracelet changes or data loads
  useEffect(() => {
    if (!loading && bracelets.length > 0) {
      const letterColors = getLetterColors();
      if (letterColors.length > 0 && !letterColors.find(c => c.id === customization.letterColor)) {
        // If current letter color is not available in the new bracelet's colors, select the first one
        setCustomization(prev => ({
          ...prev,
          letterColor: letterColors[0].id
        }));
      } else if (letterColors.length > 0 && !customization.letterColor) {
        // If no letter color is selected, select the first one
        setCustomization(prev => ({
          ...prev,
          letterColor: letterColors[0].id
        }));
      }
    }
  }, [loading, bracelets, customization.braceletStyle]); // Trigger when loading ends, bracelets change, or bracelet style changes
  
  // Organize bracelets by category dynamically
  const braceletsByCategory = {};
  if (!loading) {
    // Add 'All' category with all bracelets
    braceletsByCategory['All'] = bracelets;
    
    // Dynamically create categories based on actual data
    categories.forEach(category => {
      if (category !== 'All') {
        braceletsByCategory[category] = bracelets.filter(b => b.category === category);
      }
    });
  }

  // Dynamic function to organize charms by category
  const charmsByCategory = (categoryName = 'All') => {
    if (categoryName === 'All') {
      return charms;
    }
    
    console.log(`Filtering charms for category: "${categoryName}"`);
    console.log('Available categories map:', charmCategoriesMap);
    console.log('Available charms:', charms.map(c => ({ name: c.name, category: c.category })));
    
    return charms.filter(charm => {
      if (!charm.category) return false;
      
      // Check if categoryName is a display name, find its slug
      const categorySlug = Object.entries(charmCategoriesMap).find(([slug, displayName]) => 
        displayName === categoryName
      )?.[0];
      
      console.log(`For charm "${charm.name}": category="${charm.category}", looking for="${categoryName}", found slug="${categorySlug}"`);
      
      // Match either by slug or display name
      if (categorySlug && charm.category === categorySlug) {
        console.log(`✓ Matched by slug: ${charm.category} === ${categorySlug}`);
        return true;
      }
      
      // Direct slug match
      if (charm.category === categoryName) {
        console.log(`✓ Direct match: ${charm.category} === ${categoryName}`);
        return true;
      }
      
      // Legacy hardcoded mappings for backward compatibility
      const legacyMappings = {
        'Bestsellers': ['bestsellers'],
        'New Drops & Favs': ['new-drops', 'new-drops-favs'],
        'Personalize it': ['personalize-it']
      };
      
      if (legacyMappings[categoryName]) {
        const isLegacyMatch = legacyMappings[categoryName].includes(charm.category);
        if (isLegacyMatch) {
          console.log(`✓ Legacy match: ${charm.category} in ${legacyMappings[categoryName]}`);
        }
        return isLegacyMatch;
      }
      
      console.log(`✗ No match for charm "${charm.name}"`);
      return false;
    });
  };

  // Character validation (for allowed characters and length)
  const isValidCharacters = (text) => {
    const selectedBracelet = getSelectedBracelet();
    const isTinyWords = selectedBracelet && selectedBracelet.category === 'Tiny Words';
    
    // Different regex patterns for tiny_words vs other products
    const allowedChars = isTinyWords 
      ? /^[a-zA-Z0-9:)\<3!#&:]*$/      // No spaces for Tiny Words
      : /^[a-zA-Z0-9:)\<3!#&:\s]*$/;   // Allow spaces for others
      
    const maxLength = maxSteps === 2 ? 10 : 13; // Tiny words: 10, others: 13
    return allowedChars.test(text) && text.length <= maxLength;
  };

  // Final validation (for completed words)
  const isValidWord = (text) => {
    const maxLength = maxSteps === 2 ? 10 : 13; // Tiny words: 10, others: 13
    return text !== '' || (text.length >= 2 && text.length <= maxLength && isValidCharacters(text));
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
  const getCenteredBraceletPositions = (wordLength, isTinyWords = false) => {
    if (isTinyWords) {
      // Tiny Words: Center around positions 5-6 (max 10 positions available)
      // Even numbers: Start from 5,6 and expand outward  
      // Odd numbers: Center on 5 and expand both ways
      const tinyWordsPositionMaps = {
        1: [5],
        2: [5, 6],                           // Start 5,6
        3: [4, 5, 6],                        // Center on 5: add 4 before
        4: [4, 5, 6, 7],                     // From 5,6 → add 4 before, 7 after  
        5: [3, 4, 5, 6, 7],                  // From 4,5,6 → add 3 before, 7 after
        6: [3, 4, 5, 6, 7, 8],               // From 4,5,6,7 → add 3 before, 8 after
        7: [2, 3, 4, 5, 6, 7, 8],            // From 3,4,5,6,7 → add 2 before, 8 after
        8: [2, 3, 4, 5, 6, 7, 8, 9],         // From 3,4,5,6,7,8 → add 2 before, 9 after
        9: [1, 2, 3, 4, 5, 6, 7, 8, 9],      // From 2,3,4,5,6,7,8 → add 1 before, 9 after
        10: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] // All positions 1-10
      };
      return tinyWordsPositionMaps[wordLength] || [5];
    }
    
    // Standard Products: Center around positions 7-8 (13 positions available)
    // Even numbers: Start from 7,8 and expand outward  
    // Odd numbers: Center on 7 and expand both ways
    const standardPositionMaps = {
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
    
    return standardPositionMaps[wordLength] || [7];
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
    // Check if this is a Tiny Words product for positioning
    const selectedBracelet = getSelectedBracelet();
    const isTinyWords = selectedBracelet && selectedBracelet.category === 'Tiny Words';
    
    // Get centered positions for this word length with correct positioning logic
    const centeredPositions = getCenteredBraceletPositions(totalCharCount, isTinyWords);
    const actualBraceletPosition = centeredPositions[letterPosition]; // letterPosition is 0-indexed
    
    // Handle spaces with position-specific stone images
    if (letter === ' ') {
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
    
    // Use different base URL for Tiny Words products
    const baseUrl = isTinyWords 
      ? 'https://res.cloudinary.com/drvnwq9bm/image/upload/w_915,f_auto/customizer-v2/types/necklaces/colors'
      : 'https://res.cloudinary.com/drvnwq9bm/image/upload/w_915,f_auto/customizer-v2/colors';
    
    return `${baseUrl}/${colorCode}/${letter.toUpperCase()}/${colorCode}-${letter.toUpperCase()}-${formatCode}-${urlPosition}.png`;
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
    let colors = [];
    
    // First try to get product-specific letter colors from the selected bracelet
    const selectedBracelet = getSelectedBracelet();
    if (selectedBracelet && selectedBracelet.availableLetterColors && selectedBracelet.availableLetterColors.length > 0) {
      // Filter to only enabled colors and ensure they have required properties
      colors = selectedBracelet.availableLetterColors
        .filter(color => color.enabled !== false)
        .map(color => ({
          id: color.id,
          name: color.name || color.id.charAt(0).toUpperCase() + color.id.slice(1),
          price: parseFloat(color.price) || 0,
          color: color.color || '#ffffff'
        }));
      console.log('getLetterColors - returning product-specific colors:', colors);
    }
    // Fallback to global WordPress data  
    else if (isWordPressMode && wpData?.letterColors) {
      colors = wpData.letterColors;
      console.log('getLetterColors - returning wpData colors:', colors);
    }
    // Final fallback to mock data
    else {
      colors = mockData.letterColors;
      console.log('getLetterColors - returning mock data colors:', colors);
    }
    
    // Deduplicate by id to prevent duplicates
    const uniqueColors = colors.filter((color, index, self) => 
      index === self.findIndex((c) => c.id === color.id)
    );
    
    if (uniqueColors.length !== colors.length) {
      console.warn('getLetterColors - Found duplicate colors, removed:', colors.length - uniqueColors.length);
    }
    
    return uniqueColors;
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
    
    // Only set dataTransfer properties if they exist (HTML5 backend)
    // React DnD TouchBackend doesn't provide dataTransfer
    if (e && e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    }
  };

  const handleDragOver = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    // Only set dropEffect if dataTransfer exists (HTML5 backend)
    if (e && e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDrop = (e, dropzoneIndex) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    
    // console.log('Drop event triggered on dropzone:', dropzoneIndex, 'with draggedItem:', draggedItem);
    
    // Fallback: try to get data from dataTransfer if draggedItem is null (HTML5 backend only)
    let currentDraggedItem = draggedItem;
    if (!currentDraggedItem && e && e.dataTransfer) {
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
    // Get the current bracelet to determine if it's a NoWords product
    const selectedBracelet = getSelectedBracelet();
    const isNoWords = selectedBracelet && selectedBracelet.category === 'No Words';
    
    // Find the charm in our data to get position images
    const charm = charms.find(c => c.name === charmName || c.id === charmName);
    
    if (charm) {
      // Use NoWords position images for No Words products
      if (isNoWords && charm.noWordsPositionImages && charm.noWordsPositionImages[position + 1]) {
        console.log(`Using WordPress NoWords position image for charm ${charmName} at position ${position + 1}: ${charm.noWordsPositionImages[position + 1]}`);
        return charm.noWordsPositionImages[position + 1];
      }
      // Use regular position images for other products
      else if (!isNoWords && charm.positionImages && charm.positionImages[position + 1]) {
        console.log(`Using WordPress position image for charm ${charmName} at position ${position + 1}: ${charm.positionImages[position + 1]}`);
        return charm.positionImages[position + 1];
      }
    }
    
    // Fallback to constructed path for backward compatibility
    const folderName = charmName.toLowerCase();
    const positionNumber = position + 1;
    const imagePath = `charms/${folderName}/${charmName.charAt(0).toUpperCase() + charmName.slice(1).toLowerCase()}_POS_${positionNumber.toString().padStart(2, '0')}.webp`;
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
        right: '27%', //7
        top: '35%',
        opacity: 1
      },
      // Position 3
      {
        right: '65%', // 15
        top: '-8%',
        opacity: 1
      },
      // Position 4
      {
        bottom: '28%', //8%
        left: '-70%', // -40%
        opacity: 1
      },
      // Position 5
      {
        left: '52%', //12
        bottom: '13%', //3
        opacity: 1
      },
      // Position 6 (mirrored from position 4)
      {
        bottom: '-28%', //8
        right: '-75%', // -40
        opacity: 1
      },
      // Position 7 (mirrored from position 3)
      {
        left: '45%', //15
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

  // Screenshot capture function - now stores temporarily instead of downloading
  const captureScreenshot = async () => {
    try {
      // Find the bracelet preview container
      const previewElement = document.querySelector('.bc-bracelet-preview-container');
      if (!previewElement) {
        console.error('Preview element not found');
        return null;
      }

      // Store original styles to restore later
      const elementsToHide = [];
      
      // Hide only the empty dropzone circles (not the placed charms)
      const emptyDropzones = document.querySelectorAll('.bc-dropzone');
      emptyDropzones.forEach(el => {
        // Check if this dropzone is empty (doesn't have a charm placed)
        const hasCharmPlaced = el.querySelector('.bc-draggable-inner-item, [class*="charm-"], img[src*="charm"]');
        
        if (!hasCharmPlaced) {
          elementsToHide.push({
            element: el,
            originalStyle: el.style.cssText,
            originalDisplay: el.style.display
          });
          el.style.display = 'none';
        }
      });

      // Hide charm close buttons during capture (more specific selectors)
      const closeButtons = document.querySelectorAll('.bc-charm-close, .charm-remove-btn, .bc-remove-charm-btn, button[class*="close"], button[class*="remove"]');
      closeButtons.forEach(el => {
        elementsToHide.push({
          element: el,
          originalStyle: el.style.cssText,
          originalDisplay: el.style.display
        });
        el.style.display = 'none';
      });

      // Hide elements with specific dropzone box-shadow (the pink glow)
      const allElements = previewElement.querySelectorAll('*');
      allElements.forEach(el => {
        const computedStyle = window.getComputedStyle(el);
        const boxShadow = computedStyle.boxShadow;
        
        // Hide elements with the pink dropzone glow specifically (#da9fc466)
        if (boxShadow && boxShadow.includes('218, 159, 196')) {
          // Only hide if it's not a placed charm container
          const isPlacedCharm = el.closest('.bc-draggable-inner-item') || 
                               el.querySelector('.bc-draggable-inner-item') ||
                               el.querySelector('img[src*="charm"]');
          
          if (!isPlacedCharm) {
            elementsToHide.push({
              element: el,
              originalStyle: el.style.cssText,
              originalDisplay: el.style.display
            });
            el.style.display = 'none';
          }
        }
      });

      // Wait a bit for any loading images to complete and DOM updates
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get container dimensions for better centering
      const containerRect = previewElement.getBoundingClientRect();
      
      // First capture the raw preview without padding
      const rawDataUrl = await toPng(previewElement, {
        quality: 1.0,
        pixelRatio: 2, // For higher quality on retina displays
        backgroundColor: 'transparent', // Keep transparent for composition
        width: containerRect.width,
        height: containerRect.height,
        useCORS: true, // Handle CORS issues
        allowTaint: true, // Allow cross-origin images
        skipFonts: true, // Skip font loading to avoid delays
        filter: (node) => {
          // Skip problematic elements that might cause errors
          if (node.tagName === 'IMG') {
            // Only include images that are actually loaded
            return node.complete && node.naturalHeight !== 0;
          }
          
          // Skip any elements that are still marked as hidden
          const computedStyle = window.getComputedStyle(node);
          if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
            return false;
          }
          
          return true;
        }
      });

      // Create a properly centered composition with margins
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size with proper margins (square format)
      const margin = 60; // More margin for better centering
      const canvasSize = 600; // Larger square 600x600 output for better quality
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      
      // Fill with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasSize, canvasSize);
      
      // Create image from raw capture
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      const dataUrl = await new Promise((resolve) => {
        img.onload = () => {
          // Calculate dimensions to center the bracelet with margins
          const availableSize = canvasSize - (margin * 2);
          let drawWidth, drawHeight, drawX, drawY;
          
          // For bracelet images, we want to maintain aspect ratio and center
          const imgAspect = img.width / img.height;
          
          // Scale the image to fit within available space while maintaining aspect ratio
          if (imgAspect > 1) {
            // Image is wider than tall
            drawWidth = Math.min(availableSize, img.width);
            drawHeight = drawWidth / imgAspect;
            
            // If height exceeds available space, scale down
            if (drawHeight > availableSize) {
              drawHeight = availableSize;
              drawWidth = drawHeight * imgAspect;
            }
          } else {
            // Image is taller than wide or square
            drawHeight = Math.min(availableSize, img.height);
            drawWidth = drawHeight * imgAspect;
            
            // If width exceeds available space, scale down
            if (drawWidth > availableSize) {
              drawWidth = availableSize;
              drawHeight = drawWidth / imgAspect;
            }
          }
          
          // Center the image perfectly within the canvas
          drawX = (canvasSize - drawWidth) / 2;
          drawY = (canvasSize - drawHeight) / 2;
          
          // Draw the bracelet image centered with margins
          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
          
          resolve(canvas.toDataURL('image/png'));
        };
        
        img.onerror = () => {
          console.error('Failed to load captured image');
          resolve(rawDataUrl); // Fallback to raw capture
        };
        
        img.src = rawDataUrl;
      });

      // Restore original styles for all hidden elements
      elementsToHide.forEach(({ element, originalStyle }) => {
        element.style.cssText = originalStyle;
      });

      // Store the screenshot temporarily for use on review page
      setCapturedScreenshot(dataUrl);
      console.log('Screenshot captured and stored for review page');
      return dataUrl;
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      
      // Fallback: try with more permissive settings
      try {
        const previewElement = document.querySelector('.bc-bracelet-preview-container');
        const dataUrl = await toPng(previewElement, {
          quality: 0.8,
          pixelRatio: 1,
          backgroundColor: '#ffffff',
          skipFonts: true,
          filter: (node) => {
            // In fallback, be more permissive but still hide UI elements
            const computedStyle = window.getComputedStyle(node);
            if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
              return false;
            }
            return true;
          }
        });
        
        // Store the fallback screenshot
        setCapturedScreenshot(dataUrl);
        console.log('Screenshot captured with fallback settings and stored for review page');
        return dataUrl;
      } catch (fallbackError) {
        console.error('Fallback screenshot also failed:', fallbackError);
        alert('Unable to capture screenshot. Please try again.');
        return null;
      }
    }
  };

  if (loading) {
    return (
      <div className="bc-app" style={{ 
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

  // Mobile layout render function
  const renderMobileLayout = () => {
    return (
      <MobileLayout
        currentStep={currentStep}
        steps={steps}
        onClose={isWordPressMode ? closeModal : undefined}
        isReviewMode={isReviewMode}
        onBackStep={() => {
          if (isReviewMode) {
            setIsReviewMode(false);
            setCurrentStep(3); // Go back to Charms step
          } else {
            setCurrentStep(currentStep - 1);
          }
        }}
        bottomPanelContent={
          <div>
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
            
            {!isReviewMode && isMobileOrTablet && currentStep === 2 && steps[1] === 'Word' && (
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
                selectedBracelet={getSelectedBracelet()}
              />
            )}
            
            {!isReviewMode && currentStep === 2 && steps[1] === 'Charms' && (
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
                selectedBracelet={getSelectedBracelet()}
              />
            )}
            
            {!isReviewMode && currentStep === 3 && steps[2] === 'Charms' && (
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
                selectedBracelet={getSelectedBracelet()}
              />
            )}
            
            {isReviewMode && (
              <div>
                {/* Review Content - Mobile Optimized */}
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '600' }}>Your Custom Bracelet</h2>
                  
                  {/* Style Section */}
                  <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Style</h3>
                      <button 
                        id="bc-style-edit-btn"
                        style={{
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ 
                        width: '60px', 
                        height: '60px', 
                        background: '#e5e7eb', 
                        borderRadius: '8px', // Changed from circle to rounded square for screenshot
                        backgroundImage: `url(${capturedScreenshot || getImageUrl(getSelectedBracelet().image)})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}></div>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: '600' }}>{getSelectedBracelet().name}</div>
                      </div>
                    </div>
                    <div>
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
                  
                  {/* Word Section - only show for products that have word step */}
                  {steps.includes('Word') && (
                  <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Word</h3>
                      <button 
                        id="bc-word-edit-btn"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#4F46E5',
                          fontSize: '14px',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                        onClick={() => {setIsReviewMode(false); setCurrentStep(steps.indexOf('Word') + 1);}}>
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
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
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
                  )}
                  
                  {/* Charms Section - only show for products that have charm step */}
                  {steps.includes('Charms') && (
                  <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Charms ({customization.selectedCharms.length})</h3>
                      <button 
                        id="bc-charms-edit-btn"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#4F46E5',
                          fontSize: '14px',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                        onClick={() => {setIsReviewMode(false); setCurrentStep(steps.indexOf('Charms') + 1);}}>
                        {customization.selectedCharms.length > 0 ? 'Edit' : 'Add'}
                      </button>
                    </div>
                    {customization.selectedCharms.length > 0 ? (
                      customization.selectedCharms.map((charm, index) => (
                        <div key={`mobile-review-charm-${charm.id}-${index}`} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 0',
                          borderBottom: index < customization.selectedCharms.length - 1 ? '1px solid #e5e7eb' : 'none'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ 
                              width: '32px', 
                              height: '32px', 
                              borderRadius: '6px',
                              backgroundImage: `url(${getImageUrl(charm.image)})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center'
                            }}></div>
                            <div style={{ fontSize: '14px', fontWeight: '500' }}>{charm.name}</div>
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: '600' }}>{formatPrice(charm.price)}</div>
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>No charms selected</div>
                    )}
                  </div>
                  )}
                  
                  {/* Total */}
                  <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#4F46E5', borderRadius: '8px', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '16px', fontWeight: '600' }}>Total</span>
                      <span style={{ fontSize: '20px', fontWeight: '700' }}>{formatPrice(calculateTotal())}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        }
        renderBottomButton={() => (
          currentStep === maxSteps && steps[maxSteps - 1] === 'Charms' && !isReviewMode ? (
            // Mobile: 50%/50% row layout with Your Charms and REVIEW button
            <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}>
              {/* Your Charms Section - 50% */}
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
                  fontSize: '14px', 
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6,9 12,15 18,9"></polyline>
                  </svg>
                </div>
              </div>
              
              {/* REVIEW Button - 50% */}
              <button
                style={{
                  flex: 1,
                  background: '#4F46E5',
                  color: 'white',
                  border: 'none',
                  padding: '16px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
                onClick={async () => {
                  await captureScreenshot();
                  setIsReviewMode(true);
                }}
              >
                REVIEW
              </button>
            </div>
          ) : (
            <button
              id="bc-next-button"
              style={{
                width: '100%',
                background: (currentStep === 2 && steps[1] === 'Word' && !isValidWord(customization.word)) || isAddingToCart
                  ? '#9ca3af' 
                  : '#4F46E5',
                color: 'white',
                border: 'none',
                padding: '16px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '16px',
                cursor: (currentStep === 2 && steps[1] === 'Word' && !isValidWord(customization.word)) || isAddingToCart
                  ? 'not-allowed' 
                  : 'pointer',
                position: 'relative'
              }}
              disabled={(currentStep === 2 && steps[1] === 'Word' && !isValidWord(customization.word)) || isAddingToCart}
            onClick={async () => {
              if (isReviewMode) {
                if (isWordPressMode) {
                  try {
                    // Set loading state and disable app
                    setIsAddingToCart(true);
                    
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
                    
                    const result = await addToCart(productData, customizationData, capturedScreenshot);
                    if (result) {
                      // Redirect to cart page
                      const cartUrl = window.BraceletCustomizerConfig?.woocommerce?.cartUrl || '/cart';
                      window.location.href = cartUrl;
                    } else {
                      setIsAddingToCart(false);
                      alert('Error adding to cart. Please try again.');
                    }
                  } catch (error) {
                    setIsAddingToCart(false);
                    alert('Error adding to cart. Please try again.');
                    console.error('Add to cart error:', error);
                  }
                } else {
                  alert(`Add to Cart ${formatPrice(calculateTotal())}`);
                }
              } else if (currentStep < maxSteps) {
                if (steps[currentStep - 1] === 'Word' && !isValidWord(customization.word)) {
                  return;
                }
                setCurrentStep(currentStep + 1);
              } else {
                setIsReviewMode(true);
              }
            }}
          >
              {isAddingToCart && isReviewMode 
                ? 'ADDING TO CART...' 
                : isReviewMode 
                  ? `ADD TO CART • ${formatPrice(calculateTotal())}` 
                  : 'NEXT'
              }
            </button>
          )
        )}
      >
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
          isMobile={true}
        />
      </MobileLayout>
    );
  };

  return (
    <CustomDndProvider>
      <div className="bc-app" style={{ 
        position: 'relative',
        pointerEvents: isAddingToCart ? 'none' : 'auto' 
      }}>
      {/* Loading Overlay */}
      {isAddingToCart && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px 32px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f0f0f0',
              borderTop: '4px solid #4F46E5',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#4F46E5'
            }}>
              Adding to cart...
            </div>
          </div>
        </div>
      )}

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
      
      {/* Render Mobile Layout for Mobile/Tablet, Desktop Layout for Desktop */}
      {isMobileOrTablet ? (
        renderMobileLayout()
      ) : (
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
          <StepNavigation
            currentStep={currentStep}
            steps={steps.slice(0, maxSteps)}
            onClose={isMobileOrTablet ? () => {
              if (isWordPressMode) {
                closeModal();
              } else {
                // Standalone mode - could close or hide the app
              }
            } : undefined}
          />
          
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
          height: isMobileOrTablet ? 'auto' : '100vh',
          minHeight: isMobileOrTablet ? 'auto' : '100vh',
          maxHeight: isMobileOrTablet ? 'none' : '100vh',
          overflow: isMobileOrTablet ? 'visible' : 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: isMobileOrTablet ? 'flex-start' : 'space-between',
            alignItems: 'center',
            padding: '20px 24px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <div style={{ width: '80px' }}>
              {(currentStep > 1 || isReviewMode) && (
                <button
                  className='bc-back-button'
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

            {!isMobileOrTablet && (
              <div className='bc-site-name' style={{ fontSize: '12px', fontWeight: '600', textAlign: 'center' }}>
                <div>{window.BraceletCustomizerConfig?.siteName || 'MUMU'}</div>
              </div>
            )}

            {!isMobileOrTablet && (
              <button
                id="bc-modal-close-btn"
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  if (isWordPressMode) {
                    closeModal();
                  } else {
                    // Standalone mode - could close or hide the app
                  }
                }}
              >
                ×
              </button>
            )}
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
                    <div className='bc-qty-wrapper' style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>Qty:</span>
                      <select
                        className='bc-qty-select'
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
                      <button 
                        id="bc-desktop-style-edit-btn"
                        style={{
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
                        borderRadius: '8px', // Changed from circle to rounded square for screenshot
                        backgroundImage: `url(${capturedScreenshot || getImageUrl(getSelectedBracelet().image)})`,
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

                  {/* Lettering Section - only show for products that have word step */}
                  {steps.includes('Word') && (
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Lettering</h3>
                      <button 
                        id="bc-desktop-lettering-edit-btn"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#4F46E5',
                          fontSize: '14px',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                        onClick={() => {setIsReviewMode(false); setCurrentStep(steps.indexOf('Word') + 1);}}>
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
                  )}

                  {/* Charms Section - only show for products that have charm step */}
                  {steps.includes('Charms') && (
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Charms ({customization.selectedCharms.length})</h3>
                      <button 
                        id="bc-desktop-charms-edit-btn"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#4F46E5',
                          fontSize: '14px',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                        onClick={() => {setIsReviewMode(false); setCurrentStep(steps.indexOf('Charms') + 1);}}>
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
                  )}
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

              {!isReviewMode && !isMobileOrTablet && currentStep === 2 && steps[1] === 'Word' && (
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
                  selectedBracelet={getSelectedBracelet()}
                />
              )}

              {!isReviewMode && currentStep === 2 && steps[1] === 'Charms' && (
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
                  selectedBracelet={getSelectedBracelet()}
                />
              )}

              {!isReviewMode && currentStep === 3 && steps[2] === 'Charms' && (
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
                  selectedBracelet={getSelectedBracelet()}
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
            {currentStep === maxSteps && steps[maxSteps - 1] === 'Charms' && !isReviewMode ? (
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
                  onClick={async () => {
                    await captureScreenshot();
                    setIsReviewMode(true);
                  }}
                >
                  REVIEW
                </button>
              </div>
            ) : (
              // Other steps: Full width button
              <button
                id="bc-desktop-next-button"
                style={{
                  width: '100%',
                  background: (currentStep === 2 && steps[1] === 'Word' && !isValidWord(customization.word)) || isAddingToCart
                    ? '#9ca3af' 
                    : '#4F46E5',
                  color: 'white',
                  border: 'none',
                  padding: '16px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: (currentStep === 2 && steps[1] === 'Word' && !isValidWord(customization.word)) || isAddingToCart
                    ? 'not-allowed' 
                    : 'pointer'
                }}
                disabled={(currentStep === 2 && steps[1] === 'Word' && !isValidWord(customization.word)) || isAddingToCart}
                onClick={async () => {
                  if (isReviewMode) {
                    if (isWordPressMode) {
                      try {
                        // Set loading state and disable app
                        setIsAddingToCart(true);
                        
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
                        
                        const result = await addToCart(productData, customizationData, capturedScreenshot);
                        if (result) {
                          // Redirect to cart page
                          const cartUrl = window.BraceletCustomizerConfig?.woocommerce?.cartUrl || '/cart';
                          window.location.href = cartUrl;
                        } else {
                          setIsAddingToCart(false);
                          alert('Error adding to cart. Please try again.');
                        }
                      } catch (error) {
                        setIsAddingToCart(false);
                        alert('Error adding to cart. Please try again.');
                        console.error('Add to cart error:', error);
                      }
                    } else {
                      // Standalone mode - show alert
                      alert(`Add to Cart ${formatPrice(calculateTotal())}`);
                    }
                  } else if (currentStep < maxSteps) {
                    // Don't advance to next step if on word step and word is invalid
                    if (steps[currentStep - 1] === 'Word' && !isValidWord(customization.word)) {
                      return;
                    }
                    setCurrentStep(currentStep + 1);
                  } else {
                    setIsReviewMode(true);
                  }
                }}
              >
                {isAddingToCart && isReviewMode 
                  ? 'ADDING TO CART...' 
                  : isReviewMode 
                    ? `ADD TO CART ${formatPrice(calculateTotal())}` 
                    : (currentStep < maxSteps ? 'NEXT' : 'REVIEW')
                }
              </button>
            )}
          </div>
        </div>
      </div>
      )}
      
      {/* Expandable Charms Summary Overlay */}
      {currentStep === maxSteps && steps[maxSteps - 1] === 'Charms' && !isReviewMode && isCharmSummaryExpanded && customization.selectedCharms.length > 0 && (
        <div id='bc-charm-summary-overlay' style={{
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
    </CustomDndProvider>
  );
}

export default App;