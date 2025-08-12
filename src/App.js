import React, { useState } from 'react';
import './App.css';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [customization, setCustomization] = useState({
    braceletStyle: 'bluestone',
    word: 'HELLO',
    letterColor: 'white',
    selectedCharms: [],
    size: 'xs'
  });

  const steps = ['Design', 'Word', 'Charms'];

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
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '300px',
                height: '300px',
                border: '20px solid #93C5FD',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 'bold',
                backgroundColor: 'white',
                margin: '0 auto 20px'
              }}>
                {customization.word}
              </div>
              <p>Bracelet Preview</p>
              <p>Style: {customization.braceletStyle}</p>
              <p>Word: {customization.word}</p>
              <p>Letter Color: {customization.letterColor}</p>
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

          {/* Step Navigation */}
          <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              {steps.map((step, index) => (
                <React.Fragment key={step}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: `2px solid ${currentStep >= index + 1 ? '#4F46E5' : '#e5e7eb'}`,
                    background: currentStep >= index + 1 ? '#4F46E5' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: currentStep >= index + 1 ? 'white' : '#9ca3af',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }} onClick={() => setCurrentStep(index + 1)}>
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div style={{
                      flex: 1,
                      height: '2px',
                      background: currentStep > index + 1 ? '#4F46E5' : '#e5e7eb',
                      margin: '0 8px',
                      alignSelf: 'center'
                    }} />
                  )}
                </React.Fragment>
              ))}
            </div>

            <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0', marginBottom: '24px' }}>
              {steps.map((step, index) => (
                <button
                  key={step}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: 'none',
                    background: 'none',
                    borderBottom: `2px solid ${currentStep === index + 1 ? '#4F46E5' : 'transparent'}`,
                    color: currentStep === index + 1 ? '#4F46E5' : '#9ca3af',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                  onClick={() => setCurrentStep(index + 1)}
                >
                  {step}
                </button>
              ))}
            </div>

            {/* Step Content */}
            <div style={{ flex: 1 }}>
              {currentStep === 1 && (
                <div>
                  <h3>Choose Your Bracelet Style</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {['Gold Plated', 'Bluestone', 'Rainbow', 'Pink Chalk'].map(style => (
                      <button
                        key={style}
                        style={{
                          padding: '16px',
                          border: `2px solid ${customization.braceletStyle === style.toLowerCase().replace(' ', '-') ? '#4F46E5' : '#f3f4f6'}`,
                          borderRadius: '8px',
                          background: 'white',
                          textAlign: 'center',
                          cursor: 'pointer'
                        }}
                        onClick={() => setCustomization({...customization, braceletStyle: style.toLowerCase().replace(' ', '-')})}
                      >
                        <div style={{ width: '40px', height: '40px', background: '#e5e7eb', borderRadius: '50%', margin: '0 auto 8px' }}></div>
                        <div style={{ fontSize: '12px' }}>{style}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h3>Enter Your Word</h3>
                  <input
                    type="text"
                    value={customization.word}
                    onChange={(e) => setCustomization({...customization, word: e.target.value.toUpperCase()})}
                    style={{
                      width: '100%',
                      padding: '16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      textAlign: 'center',
                      marginBottom: '16px'
                    }}
                    placeholder="LET THEM"
                    maxLength="13"
                  />
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '24px' }}>
                    {13 - customization.word.length} characters remaining
                  </div>
                  
                  <h4>Letter Color</h4>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {[
                      { id: 'white', name: 'White', color: '#FFFFFF' },
                      { id: 'pink', name: 'Pink', color: '#F8BBD9' },
                      { id: 'black', name: 'Black', color: '#000000' },
                      { id: 'gold', name: 'Gold', color: '#FFD700' }
                    ].map(color => (
                      <button
                        key={color.id}
                        style={{
                          padding: '12px',
                          border: `2px solid ${customization.letterColor === color.id ? '#4F46E5' : '#f3f4f6'}`,
                          borderRadius: '8px',
                          background: 'white',
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                        onClick={() => setCustomization({...customization, letterColor: color.id})}
                      >
                        <div style={{
                          width: '20px',
                          height: '20px',
                          background: color.color,
                          borderRadius: '50%',
                          border: '1px solid #e5e7eb',
                          margin: '0 auto 4px'
                        }}></div>
                        <div style={{ fontSize: '11px' }}>{color.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <h3>Add Charms (Optional)</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {['Teacher', 'Apple', 'Heart', 'Star', 'Cross', 'Rainbow'].map(charm => (
                      <button
                        key={charm}
                        style={{
                          padding: '12px',
                          border: '2px solid #f3f4f6',
                          borderRadius: '8px',
                          background: 'white',
                          textAlign: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ width: '40px', height: '40px', background: '#e5e7eb', borderRadius: '8px', margin: '0 auto 8px' }}></div>
                        <div style={{ fontSize: '11px' }}>{charm}</div>
                        <div style={{ fontSize: '11px', fontWeight: '600' }}>$14</div>
                      </button>
                    ))}
                  </div>
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
                background: '#4F46E5',
                color: 'white',
                border: 'none',
                padding: '16px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
              onClick={() => currentStep < 3 ? setCurrentStep(currentStep + 1) : alert('Add to Cart!')}
            >
              {currentStep < 3 ? 'NEXT' : 'ADD TO CART $49'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;