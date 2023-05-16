import React, { useEffect, useRef, forwardRef } from 'react'


interface CanvasProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  draw: (ctx: CanvasRenderingContext2D, frameCount: number) => void,
}
const useForwardRef = <T,>(
  ref: React.ForwardedRef<T>,
  initialValue: any = null
) => {
  const targetRef = useRef<T>(initialValue);

  useEffect(() => {
    if (!ref) return;

    if (typeof ref === 'function') {
      ref(targetRef.current);
    } else {
      ref.current = targetRef.current;
    }
  }, [ref]);

  return targetRef;
};
const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>((props, ref) => {
  const { draw } = props;
  const canvasRef = useForwardRef<HTMLCanvasElement>(ref);
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
      frameCount++;
      draw(context, frameCount)
      animationFrameId = window.requestAnimationFrame(render)
    }
    render()

    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
    
  }, [draw])
  
  return <canvas ref={canvasRef} {...props}/>
});

export default Canvas