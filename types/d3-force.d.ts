declare module 'd3-force' {
  export type SimulationNodeDatum = {
    index?: number
    x?: number
    y?: number
    vx?: number
    vy?: number
    fx?: number | null
    fy?: number | null
  }

  export type SimulationLinkDatum<NodeDatum> = {
    source: string | number | NodeDatum
    target: string | number | NodeDatum
    index?: number
  }

  export function forceSimulation<NodeDatum extends SimulationNodeDatum>(nodes?: NodeDatum[]): any
  export function forceManyBody<NodeDatum extends SimulationNodeDatum>(): any
  export function forceCenter(x?: number, y?: number): any
  export function forceCollide<NodeDatum extends SimulationNodeDatum>(radius?: number | ((d: NodeDatum) => number)): any
  export function forceLink<NodeDatum extends SimulationNodeDatum, LinkDatum extends SimulationLinkDatum<NodeDatum>>(
    links?: LinkDatum[]
  ): any
}

