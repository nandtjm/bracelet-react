// Test final centering approach with bounds checking

const getCenteredBraceletPositions = (wordLength) => {
  // Total bracelet positions: 13 (positions 01-13)
  // Adjust centering based on word length to better match Little Words Project
  let centerPosition;
  
  if (wordLength <= 7) {
    // For shorter words, use different centering for odd vs even
    if (wordLength % 2 === 1) {
      // Odd word lengths: center slightly higher (position 6 instead of 7)
      centerPosition = 6;
    } else {
      // Even word lengths: use standard center (position 7)
      centerPosition = 7;
    }
  } else {
    // For longer words (8+ chars), always use position 7 to stay within bounds
    centerPosition = 7;
  }
  
  // Calculate starting position to center the word
  let startPosition = centerPosition - Math.floor((wordLength - 1) / 2);
  
  // Ensure we stay within bounds (positions 1-13)
  if (startPosition < 1) {
    startPosition = 1;
  }
  if (startPosition + wordLength - 1 > 13) {
    startPosition = 13 - wordLength + 1;
  }
  
  const positions = [];
  for (let i = 0; i < wordLength; i++) {
    positions.push(startPosition + i);
  }
  
  return positions;
};

console.log('Final centering with bounds checking:');
console.log('3 chars (NAN):', getCenteredBraceletPositions(3), '← should fix overlap');
console.log('4 chars (NAND):', getCenteredBraceletPositions(4), '← stays same');
console.log('5 chars:', getCenteredBraceletPositions(5), '← should fix spacing');
console.log('6 chars:', getCenteredBraceletPositions(6), '← stays same');
console.log('7 chars:', getCenteredBraceletPositions(7), '← should fix spacing');
console.log('9 chars:', getCenteredBraceletPositions(9), '← now bounded');
console.log('11 chars:', getCenteredBraceletPositions(11), '← now bounded');
console.log('13 chars:', getCenteredBraceletPositions(13), '← now bounded');