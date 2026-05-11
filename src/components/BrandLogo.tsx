import { Home } from 'lucide-react';

interface BrandLogoProps {
  size?: 'sm' | 'md';
}

export default function BrandLogo({ size = 'md' }: BrandLogoProps) {
  const iconSize = size === 'sm' ? 16 : 18;
  const boxSize = size === 'sm' ? '28px' : '34px';
  const fontSize = size === 'sm' ? '16px' : '19px';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{
        width: boxSize, height: boxSize, background: '#c8e06a',
        borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Home size={iconSize} color="#1a2e1a" strokeWidth={2.2} />
      </div>
      <span style={{
        fontFamily: "'Fraunces', serif", fontSize, color: '#e8f0c8', fontWeight: 300, letterSpacing: '0.01em',
      }}>
        Doméstica
      </span>
    </div>
  );
}