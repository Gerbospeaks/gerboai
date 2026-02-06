import React from 'react';

const SignatureStamp = ({ 
  text = "APPROVED", 
  color = "#d32f2f", 
  showDate = true, 
  rotation = -5,
  size = "medium" // small, medium, large
}) => {
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  });

  const sizes = {
    small: { padding: '10px 20px', fontSize: '16px', dateSize: '10px', border: '2px' },
    medium: { padding: '15px 25px', fontSize: '20px', dateSize: '12px', border: '3px' },
    large: { padding: '20px 30px', fontSize: '24px', dateSize: '14px', border: '4px' }
  };

  const sizeConfig = sizes[size] || sizes.medium;

  return (
    <div 
      style={{
        display: 'inline-block',
        padding: sizeConfig.padding,
        border: `${sizeConfig.border} solid ${color}`,
        borderRadius: '8px',
        transform: `rotate(${rotation}deg)`,
        background: `${color}0d`,
        fontFamily: 'Courier New, monospace',
      }}
    >
      <div style={{
        fontWeight: 'bold',
        outline: `2px solid ${color}`,
        fontSize: sizeConfig.fontSize,
        color: color,
        textTransform: 'uppercase',
        letterSpacing: '2px',
        textAlign: 'center',
      }}>
        {text}
      </div>
      {showDate && (
        <div style={{
          fontSize: sizeConfig.dateSize,
          color: color,
          textAlign: 'center',
          marginTop: '6px',
        }}>
          {today}
        </div>
      )}
    </div>
  );
};

export default SignatureStamp;