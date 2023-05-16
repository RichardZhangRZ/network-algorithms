import { DVNetwork } from "./NetworkTopologies";
import routerImg from "../assets/router.png";
import { DVRouter } from "./NetworkEntities";
import { squared_dist } from "./Helpers";

class DVIdleState implements SimulatorState {
  currentTopology: DVNetwork;

  constructor(currentTopology: DVNetwork) {
    this.currentTopology = currentTopology;
  }
  mouseClickTransition(_?: [number, number] | undefined): SimulatorState {
    return this;
  }

  mouseMoveTransition(_?: [number, number] | undefined): SimulatorState {
    return this;
  }

  draw(ctx: CanvasRenderingContext2D) {
    
    for (const router of this.currentTopology.routers) {
      const image = new Image();
      image.src = routerImg;
      ctx.fillText(
        router.name,
        router.position[0],
        router.position[1] - this.currentTopology.routerRadius / 3
      );
      ctx.drawImage(
        image,
        router.position[0] - this.currentTopology.routerRadius / 2,
        router.position[1] - this.currentTopology.routerRadius / 2,
        this.currentTopology.routerRadius,
        this.currentTopology.routerRadius
      );
    }

    const links = this.currentTopology.getLinks();
    for (const link of links) {
      ctx.beginPath();
      ctx.moveTo(link.routerA.position[0], link.routerA.position[1]);
      ctx.lineTo(link.routerB.position[0], link.routerB.position[1]);
      ctx.stroke();
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
        router.position[1] - this.currentTopology.routerRadius / 3
      );
      ctx.drawImage(
        image,
        router.position[0] - this.currentTopology.routerRadius / 2,
        router.position[1] - this.currentTopology.routerRadius / 2,
        this.currentTopology.routerRadius,
        this.currentTopology.routerRadius
      );
    }
    const image = new Image();
    image.src = routerImg;
    ctx.fillText(
      this.nextRouterName,
      this.currentHoveringRouterPosition[0],
      this.currentHoveringRouterPosition[1] -
        this.currentTopology.routerRadius / 3
    );
    ctx.drawImage(
      image,
      this.currentHoveringRouterPosition[0] -
        this.currentTopology.routerRadius / 2,
      this.currentHoveringRouterPosition[1] -
        this.currentTopology.routerRadius / 2,
      this.currentTopology.routerRadius,
      this.currentTopology.routerRadius
    );

    const links = this.currentTopology.getLinks();
    for (const link of links) {
      ctx.beginPath();
      ctx.moveTo(link.routerA.position[0], link.routerA.position[1]);
      ctx.lineTo(link.routerB.position[0], link.routerB.position[1]);
      ctx.stroke();
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
      this.currentTopology.routerRadius * this.currentTopology.routerRadius
    ) {
      this.highlightedRouter = closestRouter;
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
        router.position[1] - this.currentTopology.routerRadius / 3
      );
      ctx.drawImage(
        image,
        router.position[0] - this.currentTopology.routerRadius / 2,
        router.position[1] - this.currentTopology.routerRadius / 2,
        this.currentTopology.routerRadius,
        this.currentTopology.routerRadius
      );
      ctx.restore();
    }

    const links = this.currentTopology.getLinks();
    for (const link of links) {
      ctx.beginPath();
      ctx.moveTo(link.routerA.position[0], link.routerA.position[1]);
      ctx.lineTo(link.routerB.position[0], link.routerB.position[1]);
      ctx.stroke();
    }
  }

  addLinkToCurrentTopology() {
    if (!this.firstEnd || !this.secondEnd) {
      return;
    }
    this.currentTopology.addLink(this.firstEnd, this.secondEnd, this.currentWeight);
  }
}

export { AddDVRouterState, DVIdleState, EditDVRouterState };
