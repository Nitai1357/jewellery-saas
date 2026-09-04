import { ImageResponse } from 'next/og';
import React from 'react';

export const runtime = 'edge';
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 22,
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
          fontWeight: 700,
          fontFamily: 'sans-serif',
        }}
      >
        <span style={{ color: '#d4af37' }}>K</span>
        <span style={{ color: '#ffffff' }}>T</span>
      </div>
    ),
    { ...size }
  );
}