import { useRef, useEffect } from 'react'

const useCanvas = (draw: (ctx: CanvasRenderingContext2D, frameCount: number) => void) => {
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef || !canvasRef.current) {
      return;
    }
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    let frameCount = 0;
    let animationFrameId: number;
    if (!context) {
      return;
    }

    const render = () => {
      frameCount++
      draw(context, frameCount)
      animationFrameId = window.requestAnimationFrame(render)
    }
    render()

    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
    
  }, [draw])

  return canvasRef;
}

export default useCanvas