import { DVNetwork } from "./NetworkTopologies";
import routerImg from "../assets/router.png";
import whiteCoveringImg from "../assets/router-white-mask.png";
import { ChangeStatus, DVPacket, DVRouter } from "./NetworkEntities";
import { squared_dist } from "../graphics/math-helpers";
import {
  drawDVInformation,
  drawLink,
  wrapText,
} from "../graphics/graphics-helpers";
import globalEventTarget from "./GlobalEventTarget";

class DVIdleState implements SimulatorState {
  currentTopology: DVNetwork;
  currentHoveredRouter: DVRouter | null;

  constructor(currentTopology: DVNetwork) {
    this.currentTopology = currentTopology;
    this.currentHoveredRouter = null;
  }
  cleanup(): void {
    return;
  }
  mouseClickTransition(_?: [number, number] | undefined): SimulatorState {
    return this;
  }

  mouseMoveTransition(
    movePosition?: [number, number] | undefined
  ): SimulatorState {
    if (movePosition) {
      const closestRouter =
        this.currentTopology.findClosestRouterToPosition(movePosition);
      if (!closestRouter) {
        return this;
      }
      if (
        squared_dist(closestRouter.position, movePosition) <
        (this.currentTopology.routerWidth / 2) *
          (this.currentTopology.routerWidth / 2)
      ) {
        this.currentHoveredRouter = closestRouter;
      } else {
        this.currentHoveredRouter = null;
      }
    }
    return this;
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Display distance vector overlay
    if (this.currentHoveredRouter) {
      drawDVInformation(ctx, this.currentHoveredRouter, this.currentTopology);
    }

    for (const router of this.currentTopology.routers) {
      const image = new Image();
      image.src = routerImg;
      ctx.fillText(
        router.name,
        router.position[0],
        router.position[1] - this.currentTopology.routerWidth / 2 - 5
      );
      ctx.drawImage(
        image,
        router.position[0] - this.currentTopology.routerWidth / 2,
        router.position[1] - this.currentTopology.routerWidth / 2,
        this.currentTopology.routerWidth,
        this.currentTopology.routerWidth
      );
    }

    const links = this.currentTopology.getLinks();
    for (const link of links) {
      drawLink(ctx, link);
    }
  }
}

class AddDVRouterState implements SimulatorState {
  currentTopology: DVNetwork;
  nextRouterName: string;
  currentHoveringRouterPosition: [number, number];
  constructor(currentTopology: DVNetwork, nextRouterName: string) {
    this.currentTopology = currentTopology;
    this.nextRouterName = nextRouterName;
    this.currentHoveringRouterPosition = [0, 0];
  }
  cleanup(): void {
    return;
  }

  mouseClickTransition(
    clickPosition?: [number, number] | undefined
  ): SimulatorState {
    if (!clickPosition) {
      return new DVIdleState(this.currentTopology);
    }
    this.currentTopology.addRouter(clickPosition, this.nextRouterName);
    return new DVIdleState(this.currentTopology);
  }

  mouseMoveTransition(
    movePosition?: [number, number] | undefined
  ): SimulatorState {
    if (!movePosition) {
      return new DVIdleState(this.currentTopology);
    }
    this.currentHoveringRouterPosition = movePosition;
    return this;
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const router of this.currentTopology.routers) {
      const image = new Image();
      image.src = routerImg;
      ctx.fillText(
        router.name,
        router.position[0],
        router.position[1] - this.currentTopology.routerWidth / 2 - 5
      );
      ctx.drawImage(
        image,
        router.position[0] - this.currentTopology.routerWidth / 2,
        router.position[1] - this.currentTopology.routerWidth / 2,
        this.currentTopology.routerWidth,
        this.currentTopology.routerWidth
      );
    }
    const image = new Image();
    image.src = routerImg;
    ctx.fillText(
      this.nextRouterName,
      this.currentHoveringRouterPosition[0],
      this.currentHoveringRouterPosition[1] -
        this.currentTopology.routerWidth / 2 -
        5
    );
    ctx.drawImage(
      image,
      this.currentHoveringRouterPosition[0] -
        this.currentTopology.routerWidth / 2,
      this.currentHoveringRouterPosition[1] -
        this.currentTopology.routerWidth / 2,
      this.currentTopology.routerWidth,
      this.currentTopology.routerWidth
    );

    const links = this.currentTopology.getLinks();
    for (const link of links) {
      drawLink(ctx, link);
    }
  }
}

class EditDVRouterState implements SimulatorState {
  currentTopology: DVNetwork;
  firstEnd: DVRouter | null;
  secondEnd: DVRouter | null;
  highlightedRouter: DVRouter | null;
  currentWeight: number;
  openWeightModalCallback: () => void;

  constructor(currentTopology: DVNetwork, openWeighModalCallback: () => void) {
    this.currentTopology = currentTopology;
    this.firstEnd = null;
    this.secondEnd = null;
    this.highlightedRouter = null;
    this.currentWeight = 0;
    this.openWeightModalCallback = openWeighModalCallback;
  }
  cleanup(): void {
    return;
  }
  mouseClickTransition(
    clickPosition?: [number, number] | undefined
  ): SimulatorState {
    if (!clickPosition) {
      return this;
    }

    const router =
      this.currentTopology.findClosestRouterToPosition(clickPosition);
    if (!router) {
      return this;
    }

    if (!this.firstEnd) {
      this.firstEnd = router;
    } else if (!this.secondEnd && router != this.firstEnd) {
      this.secondEnd = router;
      this.openWeightModalCallback();
    }

    return this;
  }

  mouseMoveTransition(
    movePosition?: [number, number] | undefined
  ): SimulatorState {
    if (!movePosition) {
      return this;
    }
    const closestRouter =
      this.currentTopology.findClosestRouterToPosition(movePosition);
    if (!closestRouter) {
      return this;
    }
    if (
      squared_dist(closestRouter.position, movePosition) <
      (this.currentTopology.routerWidth / 2) *
        (this.currentTopology.routerWidth / 2)
    ) {
      this.highlightedRouter = closestRouter;
    } else {
      this.highlightedRouter = null;
    }
    return this;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const router of this.currentTopology.routers) {
      const image = new Image();
      image.src = routerImg;
      ctx.save();
      if (
        router == this.firstEnd ||
        router == this.secondEnd ||
        router == this.highlightedRouter
      ) {
        ctx.globalAlpha = 1.0;
      } else {
        ctx.globalAlpha = 0.4;
      }

      ctx.fillText(
        router.name,
        router.position[0],
        router.position[1] - this.currentTopology.routerWidth / 2 - 5
      );

      ctx.drawImage(
        image,
        router.position[0] - this.currentTopology.routerWidth / 2,
        router.position[1] - this.currentTopology.routerWidth / 2,
        this.currentTopology.routerWidth,
        this.currentTopology.routerWidth
      );
      ctx.restore();
    }

    for (const router of this.currentTopology.routers) {
      const white_covering = new Image();
      white_covering.src = whiteCoveringImg;
      ctx.drawImage(
        white_covering,
        router.position[0] - this.currentTopology.routerWidth / 2,
        router.position[1] - this.currentTopology.routerWidth / 2,
        this.currentTopology.routerWidth,
        this.currentTopology.routerWidth
      );
    }

    const links = this.currentTopology.getLinks();
    for (const link of links) {
      drawLink(ctx, link);
    }
  }

  addLinkToCurrentTopology() {
    if (!this.firstEnd || !this.secondEnd) {
      return;
    }
    this.currentTopology.addLink(
      this.firstEnd,
      this.secondEnd,
      this.currentWeight
    );
  }
}

class RunDVAlgorithmState implements SimulatorState {
  currentTopology: DVNetwork;
  roundNum;
  tickTime;
  currentIntervalID;

  constructor(currentTopology: DVNetwork) {
    this.currentTopology = currentTopology;
    this.roundNum = 0;
    this.tickTime = 10;
    this.currentIntervalID = setInterval(this.tick.bind(this), this.tickTime);
  }

  cleanup(): void {
    clearInterval(this.currentIntervalID);
  }

  mouseMoveTransition(_?: [number, number] | undefined): SimulatorState {
    return this;
  }

  mouseClickTransition(_?: [number, number] | undefined): SimulatorState {
    return this;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const router of this.currentTopology.routers) {
      const image = new Image();
      image.src = routerImg;
      ctx.fillText(
        router.name,
        router.position[0],
        router.position[1] - this.currentTopology.routerWidth / 2 - 5
      );
      ctx.drawImage(
        image,
        router.position[0] - this.currentTopology.routerWidth / 2,
        router.position[1] - this.currentTopology.routerWidth / 2,
        this.currentTopology.routerWidth,
        this.currentTopology.routerWidth
      );
    }
    const image = new Image();
    image.src = routerImg;

    const links = this.currentTopology.getLinks();
    for (const link of links) {
      ctx.beginPath();
      ctx.moveTo(link.routerA.position[0], link.routerA.position[1]);
      ctx.lineTo(link.routerB.position[0], link.routerB.position[1]);
      ctx.stroke();
    }

    for (const packet of this.currentTopology.packets) {
      const posX =
        packet.source.position[0] +
        (packet.destination.position[0] - packet.source.position[0]) *
          packet.transmission_progress;
      const posY =
        packet.source.position[1] +
        (packet.destination.position[1] - packet.source.position[1]) *
          packet.transmission_progress;
      ctx.beginPath();
      ctx.rect(posX, posY, 20, 30);
      ctx.stroke();
    }
  }

  tick() {
    if (this.roundNum == 0 && this.currentTopology.packets.size == 0) {
      for (const source of this.currentTopology.routers) {
        for (const dest of source.localLinkState.keys()) {
          const newPacket = new DVPacket(source, dest, source.localLinkState);
          this.currentTopology.packets.add(newPacket);
        }
      }
    }

    const changedRouters: Set<DVRouter> = new Set();
    const nextRound = this.roundNum + 1;
    for (const packet of this.currentTopology.packets) {
      packet.transmission_progress +=
        this.currentTopology.commonTransmissionSpeed * (this.tickTime / 1000);
      if (packet.transmission_progress >= 1.0) {
        const result = packet.destination.updateDistanceVector(packet);
        if (result == ChangeStatus.DV_CHANGED)
          changedRouters.add(packet.destination);
        this.currentTopology.packets.delete(packet);
        packet.transmission_progress = 0;
        this.roundNum = nextRound;
      }
    }

    for (const router of changedRouters) {
      for (const dest of router.localLinkState.keys()) {
        if (router != dest) {
          const newPacket = new DVPacket(router, dest, router.distanceVector);
          this.currentTopology.packets.add(newPacket);
        }
      }
    }

    if (this.currentTopology.packets.size == 0) {
      const transitionToIdleStateEvent = new CustomEvent<SimulatorState>(
        "transition",
        { detail: new DVIdleState(this.currentTopology) }
      );

      globalEventTarget.dispatchEvent(transitionToIdleStateEvent);
    }
  }
}

export {
  AddDVRouterState,
  DVIdleState,
  EditDVRouterState,
  RunDVAlgorithmState,
};
