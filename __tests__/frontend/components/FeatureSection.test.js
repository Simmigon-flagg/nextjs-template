// __tests__/components/FeatureSection.test.js
import { render, screen } from '@testing-library/react';
import FeatureSection from '@/app/components/FeatureSection/FeatureSection';

// Mock framer-motion to render a simple div
jest.mock('framer-motion', () => {
  return {
    motion: {
      div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
  };
});

describe('FeatureSection component', () => {
  it('renders all feature titles and descriptions', () => {
    render(<FeatureSection />);

    // Titles
    expect(screen.getByText(/⚡ Lightning Fast/i)).toBeInTheDocument();
    expect(screen.getByText(/🎨 Beautifully Designed/i)).toBeInTheDocument();
    expect(screen.getByText(/🧩 Modular Architecture/i)).toBeInTheDocument();

    // Descriptions
    expect(
      screen.getByText(
        /Optimized performance with Next.js and server-side rendering/i
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Built with TailwindCSS and modern UI practices/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /Craft your app with components that are reusable, testable, and easy to scale/i
      )
    ).toBeInTheDocument();
  });
});
