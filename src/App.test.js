import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Design step label', () => {
  render(<App />);
  const label = screen.getByText(/Design/i);
  expect(label).toBeInTheDocument();
});
