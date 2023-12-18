interface SimulatorState {
  mouseClickTransition(clickPosition? : [number, number]): SimulatorState
  mouseMoveTransition(movePosition? : [number, number]): SimulatorState
  draw(ctx: CanvasRenderingContext2D): void;
  cleanup(): void;
}