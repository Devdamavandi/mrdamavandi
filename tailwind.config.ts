
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],

  plugins: [
  ],
  // Add this for v4
  future: {
    hoverOnlyWhenSupported: true,
  }
}

export default config
