import React from 'react';

const MobileLayout = ({ 
  currentStep, 
  steps, 
  children, 
  onClose, 
  renderStepContent,
  renderBottomButton,
  bottomPanelContent,
  showBottomPanel = true,
  onBackStep,
  isReviewMode
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      maxHeight: '100vh',
      overflow: 'hidden',
      background: '#f9fafb'
    }}>
      {/* Sticky Step Navigation - Top */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#f9fafb',
        paddingTop: '12px',
        paddingBottom: '8px',
        paddingLeft: '20px',
        paddingRight: '20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          {/* Back Button */}
          <div style={{ width: '80px', display: 'flex', justifyContent: 'flex-start' }}>
            {(currentStep > 1 || isReviewMode) && (
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '14px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  fontWeight: '500',
                  padding: '4px 0'
                }}
                onClick={() => {
                  if (onBackStep) {
                    onBackStep();
                  }
                }}
              >
                ← {isReviewMode ? 'Charms' : steps[currentStep - 2]}
              </button>
            )}
          </div>

          {/* Step Indicators */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0px',
            flex: 1,
            justifyContent: 'center'
          }}>
            {steps.map((step, index) => (
              <div className='bc-step-wrapper' key={step} style={{ display: 'flex', alignItems: 'center' }}>
                {/* Step Circle */}
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: index + 1 === currentStep ? '#4F46E5' : 
                                  index + 1 < currentStep ? '#10b981' : '#e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: index + 1 <= currentStep ? 'white' : '#9ca3af'
                }}>
                  {index + 1 < currentStep ? '✓' : index + 1}
                </div>
                
                {/* Step Label */}
                <div style={{
                  backgroundColor: index + 1 === currentStep ? '#FFB6C1' : 
                                  index + 1 < currentStep ? '#d1fae5' : '#f3f4f6',
                  paddingHorizontal: '12px',
                  paddingVertical: '6px',
                  borderRadius: '16px',
                  marginLeft: '5px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: index + 1 === currentStep ? '#1f2937' :
                          index + 1 < currentStep ? '#059669' : '#6b7280'
                }}>
                  {step}
                </div>
                
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div style={{
                    width: '12px',
                    height: '2px',
                    backgroundColor: index + 1 < currentStep ? '#10b981' : '#e5e7eb',
                    marginLeft: '6px',
                    marginRight: '6px'
                  }} />
                )}
              </div>
            ))}
          </div>

          {/* Close Button */}
          <div style={{ width: '80px', display: 'flex', justifyContent: 'flex-end' }}>
            {onClose && (
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '4px'
                }}
                onClick={onClose}
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preview Section - Middle */}
      <div style={{
        flex: '0 0 auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        minHeight: '45vh',
        maxHeight: '50vh'
      }}>
        {children}
      </div>

      {/* Bottom Panel - Scrollable Content */}
      {showBottomPanel && (
        <div className='bc-bottom-panel-mobile' style={{
          flex: 1,
          backgroundColor: 'white',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Bottom Panel Content - Scrollable */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            paddingBottom: '100px' // Space for sticky button
          }}>
            {bottomPanelContent || renderStepContent?.()}
          </div>

          {/* Sticky Bottom Button */}
          <div style={{
            position: 'sticky',
            bottom: 0,
            backgroundColor: 'white',
            padding: '16px 20px',
            borderTop: '1px solid #f0f0f0',
            zIndex: 50
          }}>
            {renderBottomButton?.()}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileLayout;