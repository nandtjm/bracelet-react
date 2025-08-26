import { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';

/**
 * WordPress Integration Hook
 * 
 * This hook manages the integration between the React app and WordPress,
 * including data fetching from WordPress REST API, WooCommerce integration,
 * and WordPress-specific functionality.
 */
export const useWordPressIntegration = () => {
  const [wpData, setWpData] = useState(null);
  const [isWordPressMode, setIsWordPressMode] = useState(false);
  const [isModalMode, setIsModalMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialProductId, setInitialProductId] = useState(null);

  // Check if we're running in WordPress environment
  useEffect(() => {
    const wpMode = typeof window !== 'undefined' && 
                   window.braceletCustomizerData && 
                   window.braceletCustomizerData.restUrl;
    
    // Check if we're in modal mode (has modal container)
    const modalMode = wpMode && document.getElementById('bracelet-customizer-modal');
    
    // Get product_id from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product_id');
    if (productId) {
      setInitialProductId(parseInt(productId));
    }
    
    setIsWordPressMode(wpMode);
    setIsModalMode(modalMode);
    
    if (wpMode) {
      setWpData(window.braceletCustomizerData);
    }
    
    setLoading(false);
  }, []);

  /**
   * Fetch bracelets from WordPress API
   */
  const fetchBracelets = async () => {
    if (!isWordPressMode || !wpData) {
      return null;
    }

    try {
      const response = await fetch(`${wpData.restUrl}bracelets`, {
        headers: {
          'X-WP-Nonce': wpData.restNonce
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch bracelets');
      }
      
      return await response.json();
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  /**
   * Fetch charms from WordPress API
   */
  const fetchCharms = async () => {
    if (!isWordPressMode || !wpData) {
      return null;
    }

    try {
      const response = await fetch(`${wpData.restUrl}charms`, {
        headers: {
          'X-WP-Nonce': wpData.restNonce
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch charms');
      }
      
      return await response.json();
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  /**
   * Save customization to WordPress
   */
  const saveCustomization = async (customizationData) => {
    if (!isWordPressMode || !wpData) {
      return null;
    }

    try {
      const response = await fetch(`${wpData.restUrl}customization`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': wpData.restNonce
        },
        body: JSON.stringify(customizationData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save customization');
      }
      
      return await response.json();
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  /**
   * Add to WooCommerce cart
   */
  const addToCart = async (productData, customizationData, capturedScreenshot = null) => {
    if (!isWordPressMode || !wpData) {
      return null;
    }

    try {
      // First save the customization
      const savedCustomization = await saveCustomization(customizationData);
      
      if (!savedCustomization) {
        throw new Error('Failed to save customization before adding to cart');
      }

      // Use captured screenshot if available, otherwise capture preview image
      let imageUrl;
      if (capturedScreenshot) {
        imageUrl = await uploadScreenshotImage(savedCustomization.id, capturedScreenshot);
      } else {
        imageUrl = await uploadPreviewImage(savedCustomization.id);
      }
      
      if (imageUrl) {
        // Add image URL to product data
        productData.custom_image_url = imageUrl;
      }

      // Then add to cart via AJAX
      const formData = new FormData();
      formData.append('action', 'bracelet_add_to_cart');
      formData.append('nonce', wpData.nonce);
      formData.append('product_data', JSON.stringify(productData));
      formData.append('customization_id', savedCustomization.id);

      const response = await fetch(wpData.ajaxUrl, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.data?.message || 'Failed to add to cart');
      }
      
      return result.data;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  /**
   * Get image URL with WordPress plugin path
   */
  const getImageUrl = (imagePath) => {
    if (!isWordPressMode || !wpData) {
      return imagePath; // Return original path for standalone mode
    }
    
    // If already a full URL, return as-is
    if (imagePath.startsWith('http') || imagePath.startsWith('https')) {
      return imagePath;
    }
    
    // If starts with /, prepend plugin images URL
    if (imagePath.startsWith('/')) {
      return wpData.imagesUrl + imagePath.substring(1);
    }
    
    // Otherwise prepend full images URL
    return wpData.imagesUrl + imagePath;
  };

  /**
   * Navigate to WordPress page
   */
  const navigateToPage = (url) => {
    if (!isWordPressMode) {
      return;
    }
    
    if (url === 'cart' && wpData.cartUrl) {
      //window.location.href = wpData.cartUrl;
    } else if (url === 'checkout' && wpData.checkoutUrl) {
      //window.location.href = wpData.checkoutUrl;
    } else {
      //window.location.href = url;
    }
  };

  /**
   * Close WordPress modal
   */
  const closeModal = () => {
    if (!isWordPressMode) {
      return;
    }
    
    // Use the global close function if available
    if (typeof window.closeBraceletCustomizer === 'function') {
      window.closeBraceletCustomizer();
      return;
    }
    
    // Fallback: trigger WordPress modal close event
    const event = new CustomEvent('braceletCustomizerClose');
    window.dispatchEvent(event);
    
    // Also try to close modal directly
    const modal = document.getElementById('bracelet-customizer-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  };

  /**
   * Upload captured screenshot image
   */
  const uploadScreenshotImage = async (customizationId, screenshotDataUrl) => {
    if (!isWordPressMode || !wpData) {
      console.log('Not in WordPress mode or no wpData available');
      return null;
    }

    console.log('Starting screenshot upload for customization ID:', customizationId);

    try {
      // Convert data URL to blob
      const response = await fetch(screenshotDataUrl);
      const blob = await response.blob();

      // Create form data for upload
      const formData = new FormData();
      formData.append('action', 'upload_preview_image');
      formData.append('nonce', wpData.nonce);
      formData.append('customization_id', customizationId);
      formData.append('image', blob, `custom-bracelet-${customizationId}.png`);

      // Upload to WordPress
      const uploadResponse = await fetch(wpData.ajaxUrl, {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload screenshot');
      }

      const result = await uploadResponse.json();
      console.log('Screenshot upload response:', result);

      if (result.success && result.data?.image_url) {
        console.log('Screenshot uploaded successfully:', result.data.image_url);
        return result.data.image_url;
      } else {
        console.error('Failed to upload screenshot:', result.data?.message || 'Unknown error');
        return null;
      }

    } catch (err) {
      console.error('Error in uploadScreenshotImage:', err);
      return null;
    }
  };

  /**
   * Capture and upload preview image
   */
  const uploadPreviewImage = async (customizationId) => {
    if (!isWordPressMode || !wpData) {
      console.log('Not in WordPress mode or no wpData available');
      return null;
    }

    console.log('Starting preview image capture for customization ID:', customizationId);

    try {
      // Add a small delay to ensure all elements are rendered
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Try to find the entire bracelet preview container first
      const previewContainer = document.querySelector('.bracelet-preview-container') || 
                              document.querySelector('.product-canvas') ||
                              document.querySelector('.product-overlapping');
      
      console.log('Preview container found:', !!previewContainer);
      console.log('Preview container element:', previewContainer);
      console.log('Preview container children:', previewContainer?.children?.length);
      
      // Check for letters and charms in the preview
      const letterElements = document.querySelectorAll('.product-overlapping-letter');
      const charmElements = document.querySelectorAll('._draggableInnerItem_1xii1_16');
      const mainBraceletImage = document.querySelector('.main-bracelet-image');
      
      console.log('Found letter elements:', letterElements.length);
      console.log('Found charm elements:', charmElements.length);
      console.log('Found main bracelet image:', !!mainBraceletImage);
      
      if (previewContainer) {
        // Use html2canvas to capture the entire preview
        if (html2canvas) {
          try {
            console.log('Attempting html2canvas capture...');
            
            // Give extra time for all images to load
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const canvas = await html2canvas(previewContainer, {
              width: 400,
              height: 400,
              backgroundColor: '#ffffff',
              useCORS: true,
              allowTaint: true,
              scale: 1,
              logging: true, // Enable logging for debugging
              removeContainer: false,
              imageTimeout: 5000, // Wait longer for images to load
              onclone: (clonedDoc) => {
                console.log('html2canvas cloned document, checking elements...');
                const clonedImages = clonedDoc.querySelectorAll('img');
                console.log('Cloned images count:', clonedImages.length);
              }
            });

            console.log('html2canvas capture successful, canvas size:', canvas.width, 'x', canvas.height);

            // Convert to base64
            const imageData = canvas.toDataURL('image/png');
            console.log('Image data length:', imageData.length);

            // Upload to WordPress
            const formData = new FormData();
            formData.append('customization_id', customizationId);
            formData.append('image_data', imageData);

            console.log('Uploading to WordPress...');
            const response = await fetch(`${wpData.restUrl}preview-image`, {
              method: 'POST',
              headers: {
                'X-WP-Nonce': wpData.restNonce
              },
              body: formData
            });

            if (!response.ok) {
              throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            console.log('Upload successful, result:', result);
            return result.image_url;
          } catch (html2canvasError) {
            console.error('html2canvas failed, falling back to manual canvas:', html2canvasError);
          }
        } else {
          console.log('html2canvas not available, using manual canvas');
        }
      } else {
        console.log('No preview container found');
      }

      // Fallback: Find the main bracelet image element and composite the preview
      const mainImage = document.querySelector('.main-bracelet-image');
      if (!mainImage || !mainImage.src) {
        console.warn('Main bracelet image not found');
        return null;
      }

      console.log('Fallback to manual composite image creation...');

      // Create canvas and capture the current visible bracelet image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size (adjust as needed for your requirements)
      canvas.width = 400;
      canvas.height = 400;
      
      // Set white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Create an image element to load the bracelet image
      const img = new Image();
      img.crossOrigin = 'anonymous';

      return new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            // Draw the bracelet image centered
            const aspectRatio = img.width / img.height;
            let drawWidth = canvas.width;
            let drawHeight = canvas.height;
            
            if (aspectRatio > 1) {
              drawHeight = canvas.height / aspectRatio;
            } else {
              drawWidth = canvas.width * aspectRatio;
            }
            
            const x = (canvas.width - drawWidth) / 2;
            const y = (canvas.height - drawHeight) / 2;
            
            ctx.drawImage(img, x, y, drawWidth, drawHeight);

            // Try to add text overlay if we can get the customization
            const wordContainer = document.querySelector('.product-overlapping-content') || 
                                document.querySelector('.letter-blocks-container') ||
                                document.querySelector('.word-overlay');
            if (wordContainer) {
              // This is a simplified text overlay - in production you'd want to render the actual letter blocks
              const textData = wordContainer.textContent || wordContainer.innerText;
              if (textData && textData.trim()) {
                ctx.font = 'bold 16px Arial';
                ctx.fillStyle = '#333333';
                ctx.textAlign = 'center';
                ctx.fillText(textData.trim(), canvas.width / 2, canvas.height - 30);
              }
            }

            // Convert to base64
            const imageData = canvas.toDataURL('image/png');

            // Upload to WordPress
            const formData = new FormData();
            formData.append('customization_id', customizationId);
            formData.append('image_data', imageData);

            fetch(`${wpData.restUrl}preview-image`, {
              method: 'POST',
              headers: {
                'X-WP-Nonce': wpData.restNonce
              },
              body: formData
            })
            .then(response => {
              if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
              }
              return response.json();
            })
            .then(result => {
              console.log('Preview image uploaded successfully:', result.image_url);
              resolve(result.image_url);
            })
            .catch(err => {
              console.error('Error uploading preview image:', err);
              resolve(null);
            });

          } catch (err) {
            console.error('Error creating canvas:', err);
            resolve(null);
          }
        };

        img.onerror = () => {
          console.error('Failed to load bracelet image for capture');
          resolve(null);
        };

        // Load the current bracelet image
        img.src = mainImage.src;
      });

    } catch (err) {
      console.error('Error in uploadPreviewImage:', err);
      return null;
    }
  };

  /**
   * Format price using WooCommerce currency settings
   */
  const formatPrice = (price) => {
    if (!isWordPressMode || !wpData?.currency) {
      return `$${price.toFixed(2)}`; // Fallback for standalone mode
    }

    const { symbol, position, thousandSeparator, decimalSeparator, decimals } = wpData.currency;
    
    // Format the number with proper separators
    const formattedNumber = price.toFixed(decimals);
    const parts = formattedNumber.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
    const finalPrice = parts.join(decimalSeparator);
    
    // Position the currency symbol
    switch (position) {
      case 'left':
        return `${symbol}${finalPrice}`;
      case 'right':
        return `${finalPrice}${symbol}`;
      case 'left_space':
        return `${symbol} ${finalPrice}`;
      case 'right_space':
        return `${finalPrice} ${symbol}`;
      default:
        return `${symbol}${finalPrice}`;
    }
  };

  return {
    wpData,
    isWordPressMode,
    isModalMode,
    loading,
    error,
    initialProductId,
    fetchBracelets,
    fetchCharms,
    saveCustomization,
    addToCart,
    getImageUrl,
    navigateToPage,
    closeModal,
    formatPrice,
    uploadPreviewImage,
    uploadScreenshotImage
  };
};

export default useWordPressIntegration;