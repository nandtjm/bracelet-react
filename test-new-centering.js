// Test new centering approach with different centers for odd/even

const getNewCenteredBraceletPositions = (wordLength) => {
  // Total bracelet positions: 13 (positions 01-13)
  // Adjust centering based on word length to better match Little Words Project
  let centerPosition;
  
  if (wordLength % 2 === 1) {
    // Odd word lengths: center slightly higher (position 6 instead of 7)
    centerPosition = 6;
  } else {
    // Even word lengths: use standard center (position 7)
    centerPosition = 7;
  }
  
  // Calculate starting position to center the word
  const startPosition = centerPosition - Math.floor((wordLength - 1) / 2);
  
  const positions = [];
  for (let i = 0; i < wordLength; i++) {
    positions.push(startPosition + i);
  }
  
  return positions;
};

console.log('New centering (odd=center6, even=center7):');
console.log('3 chars (NAN):', getNewCenteredBraceletPositions(3), '← moved up from [6,7,8]');
console.log('4 chars (NAND):', getNewCenteredBraceletPositions(4), '← same [6,7,8,9]');
console.log('5 chars:', getNewCenteredBraceletPositions(5), '← moved up from [5,6,7,8,9]');
console.log('6 chars:', getNewCenteredBraceletPositions(6), '← same [5,6,7,8,9,10]');
console.log('7 chars:', getNewCenteredBraceletPositions(7), '← moved up from [4,5,6,7,8,9,10]');
console.log('9 chars:', getNewCenteredBraceletPositions(9));
console.log('11 chars:', getNewCenteredBraceletPositions(11));
console.log('13 chars:', getNewCenteredBraceletPositions(13));