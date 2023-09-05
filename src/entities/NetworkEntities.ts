type DistanceVector = Map<DVRouter, number>;
type LinkState = Map<DVRouter, number>;

enum ChangeStatus {
  NO_CHANGE,
  DV_CHANGED,
}

class NetworkEntity {
  position: [number, number];
  constructor(position: [number, number]) {
    this.position = position;
  }
}

class DVRouter extends NetworkEntity {
  name: string;
  distanceVector: DistanceVector;
  neighboringDistanceVectors: Map<DVRouter, DistanceVector>;
  localLinkState: LinkState;
  constructor(position: [number, number], name: string) {
    super(position);
    this.name = name;
    this.distanceVector = new Map();
    this.neighboringDistanceVectors = new Map();
    this.localLinkState = new Map();
  }

  updateDistanceVector(incomingPacket: DVPacket): ChangeStatus {
    const neighbor = incomingPacket.source;
    const incomingDistanceVector = incomingPacket.distanceVectorInfo;
    let status = ChangeStatus.NO_CHANGE;
    this.neighboringDistanceVectors.set(neighbor, incomingDistanceVector);
    for (const destination of this.distanceVector.keys()) {
      let minDist = this.localLinkState.get(destination) ?? Infinity;
      for (const [neighbor, dv] of this.neighboringDistanceVectors.entries()) {
        const possibleDist =
          (dv.get(destination) ?? Infinity) +
          (this.localLinkState.get(neighbor) ?? Infinity);
        minDist = Math.min(minDist, possibleDist);
      }
      if (minDist != this.distanceVector.get(destination)) {
        status = ChangeStatus.DV_CHANGED;
        this.distanceVector.set(destination, minDist);
      }
    }
    return status;
  }

  addAdjacentLink(otherRouter: DVRouter, weight: number) {
    this.localLinkState.set(otherRouter, weight);
    if (weight < (this.distanceVector.get(otherRouter) ?? Infinity)) {
      this.distanceVector.set(otherRouter, weight);
    }
  }
}

class DVPacket {
  source: DVRouter;
  destination: DVRouter;
  distanceVectorInfo: DistanceVector;
  transmission_progress: number;

  constructor(
    source: DVRouter,
    destination: DVRouter,
    distanceVectorInfo: DistanceVector
  ) {
    this.source = source;
    this.destination = destination;
    this.distanceVectorInfo = distanceVectorInfo;
    this.transmission_progress = 0;
  }
}

class DVLink {
  routerA: DVRouter;
  routerB: DVRouter;
  weight: number;
  constructor(routerA: DVRouter, routerB: DVRouter, weight: number) {
    this.routerA = routerA;
    this.routerB = routerB;
    this.weight = weight;
  }
}

export { NetworkEntity, DVRouter, DVPacket, DVLink, ChangeStatus };
