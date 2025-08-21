import React from 'react';

const DesignStep = ({ 
  categories,
  selectedCategory,
  setSelectedCategory,
  braceletsByCategory,
  customization,
  setCustomization,
  formatPrice
}) => {
  return (
    <div>
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
            <div style={{ fontSize: '11px', color: '#6b7280' }}>{formatPrice(bracelet.basePrice)}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DesignStep;