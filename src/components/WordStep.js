import React from 'react';

const WordStep = ({ 
  mockData,
  customization,
  setCustomization,
  isValidCharacters,
  isValidWord,
  trendingWords,
  getImageUrl,
  letterColors,
  formatPrice,
  selectedBracelet
}) => {
  
  // Debug: Log letterColors to check for duplicates
  console.log('WordStep - received letterColors:', letterColors);
  console.log('WordStep - letterColors length:', letterColors?.length);
  console.log('WordStep - letterColors IDs:', letterColors?.map(c => c.id));
  
  // Check product type for different modes
  const isCollabsMode = selectedBracelet && selectedBracelet.category === 'Collabs';
  const isTinyWordsMode = selectedBracelet && selectedBracelet.category === 'Tiny Words';
  
  // Get max word length based on product type
  const maxWordLength = selectedBracelet?.maxWordLength || (isTinyWordsMode ? 10 : 13);
  
  // Create letter preview component for Collabs mode
  const LetterPreview = ({ word }) => {
    if (!word) return null;
    
    // Map letter color to URL code
    const colorMap = {
      'white': 'WL',
      'pink': 'PK', 
      'black': 'BL',
      'gold': 'GL'
    };
    
    const colorCode = colorMap[customization.letterColor] || 'WL';
    
    return (
      <div style={{
        display: 'flex',
        gap: '4px',
        alignItems: 'center',
        justifyContent: 'flex-start'
      }}>
        {word.split('').map((char, index) => {
          // Handle spaces - show empty space
          if (char === ' ') {
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
          const letterImageUrl = `https://res.cloudinary.com/drvnwq9bm/image/upload/f_auto,q_auto,w_90/customizer-v2/types/statics/${colorCode}/${char.toUpperCase()}.png`;
          console.log(`Letter ${char} URL:`, letterImageUrl);
          
          return (
            <div key={index} style={{
              width: '19px',
              height: '38px',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <img 
                src={letterImageUrl}
                alt={char}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
          );
        })}
      </div>
    );
  };
  return (
    <div>
      <h3 className="bc-letter-color-label" style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '500' }}>Letter Color</h3>
      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', alignItems: 'flex-end' }}>
        {letterColors.map(color => (
          <div key={color.id} style={{ textAlign: 'center' }}>
            <button
              id={`bc-letter-color-${color.id}`}
              style={{
                width: '64px',
                height: '64px',
                border: `3px solid ${customization.letterColor === color.id ? '#4F46E5' : 'transparent'}`,
                borderRadius: '50%',
                background: color.id === 'gold' 
                  ? `url('${getImageUrl('gold-swatch.jpg')}') center/cover` 
                  : color.color,
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
              {color.price > 0 && <span style={{ fontSize: '14px' }}> (+{formatPrice(color.price)})</span>}
            </div>
          </div>
        ))}
      </div>

      <h3 className='bc-word-label' style={{ marginBottom: '16px' }}>Enter your word</h3>
      
      {/* Different layout for Collabs vs Standard */}
      {isCollabsMode ? (
        /* Collabs mode: Input and letter preview side by side */
        <div style={{ display: 'flex', gap: '24px', marginBottom: '16px', alignItems: 'flex-start' }}>
          <div className='bc-collabs-input' style={{ flex: '1', maxWidth: '400px' }}>
            <input
              className='bc-letter-input'
              type="text"
              value={customization.word}
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
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
                boxSizing: 'border-box'
              }}
              placeholder="STAY WILD"
              maxLength={maxWordLength}
            />
          </div>
          <div style={{ flex: '1', display: 'flex', alignItems: 'center', minHeight: '56px' }}>
            <LetterPreview word={customization.word} />
          </div>
        </div>
      ) : (
        /* Standard mode: Full width input */
        <input
          className='bc-letter-input'
          type="text"
          value={customization.word}
          onChange={(e) => {
            const value = e.target.value.toUpperCase();
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
          maxLength={maxWordLength}
        />
      )}
      
      <div style={{ 
        fontSize: '12px', 
        color: '#9ca3af', 
        marginBottom: '24px',
        lineHeight: '1.4'
      }}>
{maxWordLength} characters maximum, minimum 2. Letter, number, :), &lt;3, !, #, &amp;, and : characters only.
      </div>
      
      <h4 className='bc-trending-words-label' style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>Trending Words</h4>
      <div 
        className="category-scroll"
        style={{
          display: 'flex',
          overflowX: 'auto',
          gap: '8px',
          paddingBottom: '8px'
        }}
      >
        {trendingWords.map(word => {
          // For tiny_words, check processed word (without spaces) for validation
          const processedWord = isTinyWordsMode ? word.replace(/\s/g, '') : word;
          const isWordTooLong = processedWord.length > maxWordLength;
          const isWordValid = isValidCharacters(processedWord) && processedWord.length <= maxWordLength;
          
          return (
            <button
              key={word}
              className='bc-trending-word'
              id='bc-trending-word-{{word}}'
              style={{
                padding: '12px 20px',
                border: isWordTooLong ? '1px solid #ef4444' : '1px solid #e5e7eb',
                borderRadius: '25px',
                background: isWordTooLong ? '#fef2f2' : 'white',
                color: isWordTooLong ? '#ef4444' : '#374151',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isWordTooLong ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.2s ease',
                opacity: isWordTooLong ? 0.7 : 1
              }}
              onClick={() => {
                // For tiny_words products, automatically remove spaces from trending words
                const processedWord = isTinyWordsMode ? word.replace(/\s/g, '') : word;
                const isProcessedWordValid = isValidCharacters(processedWord) && processedWord.length <= maxWordLength;
                
                if (isProcessedWordValid) {
                  setCustomization({...customization, word: processedWord});
                } else if (processedWord.length > maxWordLength) {
                  alert(`"${processedWord}" is too long for this product (${processedWord.length} characters). Maximum is ${maxWordLength} characters.`);
                } else {
                  alert(`"${processedWord}" contains invalid characters.`);
                }
              }}
              title={isWordTooLong 
                ? `Too long (${processedWord.length}/${maxWordLength} characters)${isTinyWordsMode && word !== processedWord ? ' - spaces removed' : ''}` 
                : (isTinyWordsMode && word !== processedWord ? `Will become: "${processedWord}"` : '')
              }
            >
              {word}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WordStep;