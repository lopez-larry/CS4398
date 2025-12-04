/**
 * @file App.Name.js
 * @description Basic test to verify the App component renders without crashing and includes visible text.
 *
 * Name Cases:
 *  - Renders the "AI Resume App" navbar brand
 *  - Confirms one of the route links like "Home" is visible
 */

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; // Needed for routing context
import App from './App';

test('renders navbar brand and home link', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );

  // Check for navbar brand
  expect(screen.getByText(/AI Resume App/i)).toBeInTheDocument();

  // Check for "Home" nav link
  expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
});
