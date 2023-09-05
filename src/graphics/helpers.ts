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
