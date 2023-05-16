import { squared_dist } from "./Helpers";
import { DVLink, DVPacket, DVRouter } from "./NetworkEntities";


class Network {

}

class DVNetwork extends Network {
  routers: Array<DVRouter>;
  packets: Array<DVPacket>;
  commonTransmissionSpeed = 0.05;
  routerRadius: number;

  constructor(routerRadius: number = 70) {
    super();
    this.routers = [];
    this.packets = [];
    this.routerRadius = routerRadius;
  }

  addRouter(position: [number, number], name: string) {
    const new_router = new DVRouter(position, name);
    this.routers.push(new_router);
  }

  addLink(routerA: DVRouter, routerB: DVRouter, weight: number) {
    routerA.addAdjacentLink(routerB, weight);
    routerB.addAdjacentLink(routerA, weight);
  }

  findClosestRouterToPosition(position: [number, number]) {
    if (this.routers.length == 0) {
      return null;
    }
    let closestRouter = this.routers[0];
    for (const router of this.routers) {
      const candidate_dist = squared_dist(position, router.position);
      const curr_min_dist = squared_dist(position, closestRouter.position);
      if (candidate_dist < curr_min_dist) {
        closestRouter = router;
      }
    }

    return closestRouter;
  }

  getLinks(): Array<DVLink> {
    const result: Array<DVLink> = [];
    
    const visitedSet = new Set<DVRouter>();
    for (const router of this.routers) {
      visitedSet.add(router);
      for (const [neighbor, weight] of router.localLinkState.entries()) {
        if (!visitedSet.has(neighbor)) {
          const newLink = new DVLink(router, neighbor, weight);
          result.push(newLink);
        }
      }
    }
    return result;
  }
}




export { DVNetwork, Network };