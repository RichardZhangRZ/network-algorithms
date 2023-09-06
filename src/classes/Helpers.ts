function squared_dist(pos1: [number, number], pos2: [number, number]) {
  const deltaX = pos2[0] - pos1[0];
  const deltaY = pos2[1] - pos1[1];
  return deltaX * deltaX + deltaY * deltaY;
}
export {squared_dist};

