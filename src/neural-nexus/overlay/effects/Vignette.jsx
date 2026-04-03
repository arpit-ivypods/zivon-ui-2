import React from 'react'

const Vignette = () => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 20,
        pointerEvents: 'none',
        background:
          'radial-gradient(ellipse at center, transparent 40%, rgba(3, 7, 18, 0.3) 70%, rgba(3, 7, 18, 0.6) 100%)',
      }}
    />
  )
}

export default Vignette
