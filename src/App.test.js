import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Chains step label', () => {
  render(<App />);
  const label = screen.getByText(/Chains/i);
  expect(label).toBeInTheDocument();
});
