import React from 'react';

export interface IconoProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
  size?: number | string;
}

/**
 * Componente oficial de Google Material Symbols & Icons
 * https://fonts.google.com/icons
 */
export const Icono: React.FC<IconoProps> = ({ name, className = '', style, size }) => {
  const customStyle: React.CSSProperties = { ...style };
  if (size) {
    customStyle.fontSize = typeof size === 'number' ? `${size}px` : size;
  }

  return (
    <span
      className={`icono select-none leading-none ${className}`}
      style={customStyle}
      aria-hidden="true"
    >
      {name}
    </span>
  );
};

export default Icono;
