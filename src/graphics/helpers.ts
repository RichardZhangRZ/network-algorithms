import { subtract, add, number, norm } from "mathjs";
import { DVLink } from "../classes/NetworkEntities";

export const drawLink = (ctx: CanvasRenderingContext2D, link: DVLink) => {
  const vector = subtract(link.routerB.position, link.routerA.position);

  ctx.beginPath();
  ctx.moveTo(link.routerA.position[0], link.routerA.position[1]);
  ctx.lineTo(link.routerB.position[0], link.routerB.position[1]);
  ctx.stroke();

  const textPos = add(link.routerA.position, [vector[0] / 2, vector[1] / 2]);

  const perm =
    vector[0] > 0 ? [vector[1], -vector[0]] : [-vector[1], vector[0]];
  const unitPerm = [perm[0] / number(norm(perm)), perm[1] / number(norm(perm))];

  ctx.fillText(
    link.weight.toString(),
    textPos[0] + unitPerm[0] * 10,
    textPos[1] + unitPerm[1] * 10
  );
};

export const wrapText = (
  context: CanvasRenderingContext2D,
  linesOfText: string[],
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  padding: number
) => {
  const newLinesOfText: string[] = [];

  for (const line of linesOfText) {
    const splitLines = [];
    const words = line.split(" ");

    let currLine = "";
    for (let i = 0; i < words.length; i++) {
      const testLine = currLine + words[i] + " ";
      const testWidth = context.measureText(testLine).width;

      if (testWidth > maxWidth) {
        splitLines.push(currLine);
        currLine = words[i] + " ";
      } else {
        currLine = testLine;
      }
    }
    splitLines.push(currLine);
    newLinesOfText.push(...splitLines);
  }

  let yOffset = y + padding + parseFloat(context.font);

  context.fillStyle = "white";
  for (const line of newLinesOfText) {
    context.fillText(line, x + padding, yOffset);
    yOffset += lineHeight;
  }
  context.fillStyle = "black";
  context.fillRect(
    x,
    y,
    padding * 2 + maxWidth,
    newLinesOfText.length * lineHeight + padding * 2
  );
};
