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
  formatPrice
}) => {
  return (
    <div>
      <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '500' }}>Letter Color</h3>
      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', alignItems: 'flex-end' }}>
        {letterColors.map(color => (
          <div key={color.id} style={{ textAlign: 'center' }}>
            <button
              style={{
                width: '64px',
                height: '64px',
                border: `3px solid ${customization.letterColor === color.id ? '#4F46E5' : 'transparent'}`,
                borderRadius: '50%',
                background: color.id === 'gold' 
                  ? `url('${getImageUrl('gold-swatch.jpg')}') center/cover` 
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
              {color.price > 0 && <span style={{ fontSize: '14px' }}> (+{formatPrice(color.price)})</span>}
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ marginBottom: '16px' }}>Enter your word</h3>
      <input
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
  );
};

export default WordStep;