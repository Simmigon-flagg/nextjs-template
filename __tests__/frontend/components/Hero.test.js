// __tests__/components/Hero.test.js
import { render, screen } from '@testing-library/react';
import Hero from '@/app/components/Hero/Hero';

// Mock next/image to render a simple img tag
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }) => {
    return <img src={src} alt={alt} {...props} />;
  },
}));

describe('Hero component', () => {
  it('renders heading, paragraph, buttons, and image', () => {
    render(<Hero />);

    // Check heading
    const heading = screen.getByRole('heading', {
      name: /Build Smarter. Launch Faster./i,
    });
    expect(heading).toBeInTheDocument();

    // Check paragraph
    const paragraph = screen.getByText(
      /A creative platform for building modern web experiences/i
    );
    expect(paragraph).toBeInTheDocument();

    // Check buttons
    const getStartedBtn = screen.getByRole('button', { name: /Get Started/i });
    const learnMoreBtn = screen.getByRole('button', { name: /Learn More/i });
    expect(getStartedBtn).toBeInTheDocument();
    expect(learnMoreBtn).toBeInTheDocument();

    // Check image
    const image = screen.getByAltText(/Hero Illustration/i);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/landing-illustration.png');
  });
});
