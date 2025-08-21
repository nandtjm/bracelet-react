import React from 'react';

const StepNavigation = ({ currentStep, steps, onClose }) => {
  return (
    <div style={{ marginBottom: '40px', position: 'relative', paddingTop: onClose ? '8px' : 0 }}>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
      )}
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
  );
};

export default StepNavigation;
