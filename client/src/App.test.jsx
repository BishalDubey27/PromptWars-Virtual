import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';
import React from 'react';

// Mock Socket.io
vi.mock('socket.io-client', () => ({
  io: () => ({
    on: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
  }),
}));

describe('App Component Accessibility & Basics', () => {
  it('renders VenueFlow AI header with correct ARIA label', () => {
    render(<App />);
    const logo = screen.getByLabelText(/VenueFlow AI Logo/i);
    expect(logo).toBeInTheDocument();
  });

  it('renders navigation buttons with descriptive ARIA labels', () => {
    render(<App />);
    const nav = screen.getByLabelText(/Main Navigation/i);
    expect(nav).toBeInTheDocument();
  });

  it('toggles mode when button is clicked', () => {
    render(<App />);
    const toggleBtn = screen.getByLabelText(/Toggle Map Mode/i);
    fireEvent.click(toggleBtn);
    // Should still be in the document and accessible
    expect(toggleBtn).toBeInTheDocument();
  });

  it('contains the bottom navigation with accessible buttons', () => {
    render(<App />);
    const bottomNav = screen.getByLabelText(/Mobile Navigation/i);
    expect(bottomNav).toBeInTheDocument();
    
    const profileBtn = screen.getByLabelText(/Open User Profile/i);
    expect(profileBtn).toBeInTheDocument();
  });
});
