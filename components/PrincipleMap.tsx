'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { SimulationLinkDatum, SimulationNodeDatum } from 'd3-force'
import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation } from 'd3-force'
import { FiExternalLink, FiLink2, FiMap, FiSearch, FiSliders, FiToggleLeft, FiToggleRight, FiX } from 'react-icons/fi'

type Principle = any

type GraphNode = SimulationNodeDatum & {
  id: string
  title: string
  category?: string
  author?: string
  likes?: number
  principle: Principle
}

type GraphLink = SimulationLinkDatum<GraphNode> & {
  source: string | GraphNode
  target: string | GraphNode
  weight: number // 1..5
  types: Array<'keywords' | 'category' | 'author'>
}

function tokenize(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 5)
}

function jaccard(a: Set<string>, b: Set<string>) {
  if (!a.size || !b.size) return 0
  let intersection = 0
  a.forEach((x) => {
    if (b.has(x)) intersection++
  })
  const union = a.size + b.size - intersection
  return union > 0 ? intersection / union : 0
}

export default function PrincipleMap({
  principles,
  onOpenPrinciple,
}: {
  principles: Principle[]
  onOpenPrinciple?: (p: Principle) => void
}) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [pinnedId, setPinnedId] = useState<string | null>(null)
  const [selectedEdgeKey, setSelectedEdgeKey] = useState<string | null>(null)
  const [minStrength, setMinStrength] = useState(3) // 1..5
  const [showKeywords, setShowKeywords] = useState(true)
  const [showCategory, setShowCategory] = useState(true)
  const [showAuthor, setShowAuthor] = useState(true)
  const [filterToSearch, setFilterToSearch] = useState(false)
  const [, bump] = useState(0)

  const focusId = pinnedId || hoverId

  type PairMeta = {
    a: string
    b: string
    sim: number
    sharedKeywords: string[]
    sameCategory: boolean
    sameAuthor: boolean
    weight: number
    types: GraphLink['types']
  }

  const { nodes, links, neighborMap, pairMetaMap } = useMemo(() => {
    const ns: GraphNode[] = (principles || []).map((p: any) => ({
      id: String(p.id),
      title: String(p.title || ''),
      category: p.category,
      author: p.createdBy,
      likes: typeof p.likes === 'number' ? p.likes : 0,
      principle: p,
    }))

    const kw = new Map<string, Set<string>>()
    for (const n of ns) {
      const blob = `${n.title} ${n.principle?.description ?? ''} ${n.principle?.takeHomeValue ?? ''}`
      kw.set(n.id, new Set(tokenize(blob)))
    }

    const edges = new Map<string, GraphLink>()
    const neighbors = new Map<string, Set<string>>()
    const pairMeta = new Map<string, PairMeta>()

    const addNeighbor = (a: string, b: string) => {
      if (!neighbors.has(a)) neighbors.set(a, new Set())
      neighbors.get(a)!.add(b)
    }

    const addEdge = (
      a: GraphNode,
      b: GraphNode,
      score: number,
      types: GraphLink['types'],
      sim: number,
      sharedKeywords: string[],
      sameCategory: boolean,
      sameAuthor: boolean
    ) => {
      const key = a.id < b.id ? `${a.id}__${b.id}` : `${b.id}__${a.id}`
      const w = Math.max(1, Math.min(5, Math.round(score)))
      if (!edges.has(key)) {
        edges.set(key, { source: a.id, target: b.id, weight: w, types: [...types] })
      } else {
        const existing = edges.get(key)!
        existing.weight = Math.max(existing.weight, w)
        const merged = new Set([...(existing.types || []), ...types])
        existing.types = Array.from(merged) as any
      }
      if (!pairMeta.has(key)) {
        pairMeta.set(key, {
          a: a.id < b.id ? a.id : b.id,
          b: a.id < b.id ? b.id : a.id,
          sim,
          sharedKeywords,
          sameCategory,
          sameAuthor,
          weight: w,
          types: [...types],
        })
      } else {
        const pm = pairMeta.get(key)!
        pm.weight = Math.max(pm.weight, w)
        const merged = new Set([...(pm.types || []), ...types])
        pm.types = Array.from(merged) as any
      }
      addNeighbor(a.id, b.id)
      addNeighbor(b.id, a.id)
    }

    // Similarity-first: keyword overlap drives weight; category/author add a small boost.
    for (let i = 0; i < ns.length; i++) {
      for (let j = i + 1; j < ns.length; j++) {
        const a = ns[i]
        const b = ns[j]

        const types: GraphLink['types'] = []
        const ka = kw.get(a.id) || new Set<string>()
        const kb = kw.get(b.id) || new Set<string>()
        const sim = jaccard(ka, kb) // 0..1
        const shared = Array.from(ka).filter((x) => kb.has(x))
        shared.sort()
        const sharedTop = shared.slice(0, 8)
        if (sharedTop.length > 0) types.push('keywords')

        let score = sim * 5 // 0..5
        const sameCategory = !!(a.category && b.category && a.category === b.category)
        if (sameCategory) {
          types.push('category')
          score += 0.6
        }
        const sameAuthor = !!(a.author && b.author && a.author === b.author)
        if (sameAuthor) {
          types.push('author')
          score += 0.4
        }

        // Keep only meaningful similarities; low scores produce noise.
        if (score >= 1.75) addEdge(a, b, score, types, sim, sharedTop, sameCategory, sameAuthor)
      }
    }

    // Ensure no isolated nodes: if a node has no edges, connect it to its most similar neighbor (by keyword sim).
    for (const a of ns) {
      if (neighbors.get(a.id)?.size) continue
      let best: { b: GraphNode; score: number; sim: number; sameCat: boolean; sameAuthor: boolean } | null = null
      for (const b of ns) {
        if (a.id === b.id) continue
        const ka = kw.get(a.id) || new Set<string>()
        const kb = kw.get(b.id) || new Set<string>()
        const sim = jaccard(ka, kb)
        const sameCat = !!(a.category && b.category && a.category === b.category)
        const sameAuthor = !!(a.author && b.author && a.author === b.author)
        const score = sim * 5 + (sameCat ? 0.6 : 0) + (sameAuthor ? 0.4 : 0)
        if (!best || score > best.score) best = { b, score, sim, sameCat, sameAuthor }
      }
      if (best) {
        const types: GraphLink['types'] = []
        const ka = kw.get(a.id) || new Set<string>()
        const kb = kw.get(best.b.id) || new Set<string>()
        const shared = Array.from(ka).filter((x) => kb.has(x))
        shared.sort()
        const sharedTop = shared.slice(0, 8)
        if (sharedTop.length > 0) types.push('keywords')
        if (best.sameCat) types.push('category')
        if (best.sameAuthor) types.push('author')
        addEdge(a, best.b, Math.max(1, best.score), types, best.sim, sharedTop, best.sameCat, best.sameAuthor)
      }
    }

    return { nodes: ns, links: Array.from(edges.values()), neighborMap: neighbors, pairMetaMap: pairMeta }
  }, [principles])

  useEffect(() => {
    if (!mapRef.current) return

    const width = mapRef.current.clientWidth || 1000
    const height = 540

    // Initialize positions near center
    for (const n of nodes) {
      n.x = width / 2 + (Math.random() - 0.5) * 60
      n.y = height / 2 + (Math.random() - 0.5) * 60
    }

    const sim = forceSimulation(nodes)
      .force('charge', forceManyBody().strength(-260))
      .force('center', forceCenter(width / 2, height / 2))
      .force('collide', forceCollide<GraphNode>().radius(30))
      .force(
        'link',
        forceLink<GraphNode, GraphLink>(links)
          .id((d: GraphNode) => d.id)
          .distance((l: GraphLink) => 140 - l.weight * 14)
          .strength((l: GraphLink) => Math.min(0.9, 0.25 + l.weight * 0.12))
      )

    sim.on('tick', () => {
      bump((x) => (x + 1) % 1000000)
    })

    return () => {
      sim.stop()
    }
  }, [nodes, links])

  const q = query.trim().toLowerCase()
  const matches = useMemo(() => {
    if (!q) return new Set<string>()
    const m = new Set<string>()
    for (const n of nodes) {
      if (
        n.title.toLowerCase().includes(q) ||
        String(n.category || '').toLowerCase().includes(q) ||
        String(n.author || '').toLowerCase().includes(q)
      ) {
        m.add(n.id)
      }
    }
    return m
  }, [nodes, q])

  const visibleNodeIds = useMemo(() => {
    if (!filterToSearch || !q) return new Set(nodes.map((n) => n.id))
    return matches.size ? matches : new Set(nodes.map((n) => n.id))
  }, [filterToSearch, q, matches, nodes])

  const filteredNodes = useMemo(() => nodes.filter((n) => visibleNodeIds.has(n.id)), [nodes, visibleNodeIds])

  const filteredLinks = useMemo(() => {
    const enabledTypes = new Set<string>()
    if (showKeywords) enabledTypes.add('keywords')
    if (showCategory) enabledTypes.add('category')
    if (showAuthor) enabledTypes.add('author')

    return links.filter((l) => {
      const sId = typeof l.source === 'string' ? l.source : l.source.id
      const tId = typeof l.target === 'string' ? l.target : l.target.id
      if (!visibleNodeIds.has(String(sId)) || !visibleNodeIds.has(String(tId))) return false
      if (l.weight < minStrength) return false
      return (l.types || []).some((t) => enabledTypes.has(t))
    })
  }, [links, minStrength, showKeywords, showCategory, showAuthor, visibleNodeIds])

  const viewBoxW = Math.max(900, mapRef.current?.clientWidth || 1000)
  const viewBoxH = 540

  const selectedNode = useMemo(() => nodes.find((n) => n.id === selectedId) || null, [nodes, selectedId])

  const selectedEdge = useMemo(() => {
    if (!selectedEdgeKey) return null
    return pairMetaMap.get(selectedEdgeKey) || null
  }, [pairMetaMap, selectedEdgeKey])

  const relatedList = useMemo(() => {
    if (!selectedNode) return []
    const items: Array<{ other: GraphNode; meta: PairMeta }> = []
    for (const m of Array.from(pairMetaMap.values())) {
      if (m.a === selectedNode.id || m.b === selectedNode.id) {
        const otherId = m.a === selectedNode.id ? m.b : m.a
        const other = nodes.find((n) => n.id === otherId)
        if (other) items.push({ other, meta: m })
      }
    }
    items.sort((x, y) => y.meta.weight - x.meta.weight)
    return items.slice(0, 6)
  }, [nodes, pairMetaMap, selectedNode])

  return (
    <div className="min-h-[560px]">
      <div className="mb-4 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-gray-900">
            <FiMap className="text-primary-600" />
            <div className="text-2xl font-bold">Principle Map</div>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Explore how principles cluster by theme and language. Click a node to open the reader.
          </div>
        </div>

        <div className="relative w-full md:w-96">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search nodes…"
            className="w-full pl-10 pr-3 py-2 rounded-xl bg-white/90 border border-white/70 shadow-sm"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="mb-3 flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
            <FiSliders />
            Strength
          </div>
          <input
            type="range"
            min={1}
            max={5}
            value={minStrength}
            onChange={(e) => setMinStrength(Number(e.target.value))}
            className="w-44 accent-primary-600"
          />
          <div className="text-sm font-semibold text-gray-700">≥ {minStrength}</div>

          <div className="h-6 w-px bg-gray-200 mx-1" />

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={showKeywords} onChange={(e) => setShowKeywords(e.target.checked)} className="accent-primary-600" />
            <span className="font-semibold" style={{ color: '#059669' }}>Keywords</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={showCategory} onChange={(e) => setShowCategory(e.target.checked)} className="accent-primary-600" />
            <span className="font-semibold" style={{ color: '#0284c7' }}>Category</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={showAuthor} onChange={(e) => setShowAuthor(e.target.checked)} className="accent-primary-600" />
            <span className="font-semibold" style={{ color: '#7c3aed' }}>Author</span>
          </label>

          <div className="h-6 w-px bg-gray-200 mx-1" />

          <button
            type="button"
            onClick={() => setFilterToSearch((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 border border-white/70 shadow-sm text-sm font-semibold text-gray-800 hover:bg-white transition"
          >
            {filterToSearch ? <FiToggleRight className="text-primary-600" /> : <FiToggleLeft className="text-gray-500" />}
            Filter to search
          </button>

          {pinnedId && (
            <button
              type="button"
              onClick={() => setPinnedId(null)}
              className="px-3 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-white/60 transition"
            >
              Clear focus
            </button>
          )}
        </div>

        <div className="text-xs text-gray-600">
          Tip: hover to highlight neighbors; click to pin focus.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 items-start">
        <div className="rounded-2xl bg-white/75 border border-white/40 backdrop-blur-md shadow-md overflow-hidden" ref={mapRef}>
          <svg viewBox={`0 0 ${viewBoxW} ${viewBoxH}`} className="w-full h-[540px]">
          {/* links */}
          {filteredLinks.map((l, idx) => {
            const s = (typeof l.source === 'string' ? nodes.find((n) => n.id === l.source) : l.source) as GraphNode | undefined
            const t = (typeof l.target === 'string' ? nodes.find((n) => n.id === l.target) : l.target) as GraphNode | undefined
            if (!s || !t) return null

            const sId = s.id
            const tId = t.id
            const inFocus =
              !focusId ||
              focusId === sId ||
              focusId === tId ||
              (neighborMap.get(focusId)?.has(sId) && neighborMap.get(focusId)?.has(tId) === false) // noop
            const isIncident = focusId ? focusId === sId || focusId === tId : true
            const faded = focusId ? !isIncident : false

            const has = (type: GraphLink['types'][number]) => (l.types || []).includes(type)
            let stroke = 'rgba(2,132,199,0.45)'
            if (has('keywords')) stroke = 'rgba(5,150,105,0.45)' // emerald
            if (has('category')) stroke = 'rgba(2,132,199,0.45)' // sky
            if (has('author')) stroke = 'rgba(124,58,237,0.45)' // violet
            // If multiple types, bump opacity a bit.
            const alpha = Math.min(0.7, 0.35 + (l.types?.length || 1) * 0.1)

            const edgeKey = s.id < t.id ? `${s.id}__${t.id}` : `${t.id}__${s.id}`
            const isSelectedEdge = selectedEdgeKey === edgeKey

            return (
              <g key={idx}>
                {/* visible stroke */}
                <line
                  x1={s.x ?? 0}
                  y1={s.y ?? 0}
                  x2={t.x ?? 0}
                  y2={t.y ?? 0}
                  stroke={stroke.replace(/0\.45\)$/, `${alpha})`)}
                  strokeWidth={Math.max(1.25, l.weight * 0.9)}
                  opacity={faded ? 0.12 : isSelectedEdge ? 1 : 1}
                />
                {/* hit target */}
                <line
                  x1={s.x ?? 0}
                  y1={s.y ?? 0}
                  x2={t.x ?? 0}
                  y2={t.y ?? 0}
                  stroke="transparent"
                  strokeWidth={12}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedEdgeKey((prev) => (prev === edgeKey ? null : edgeKey))
                    setSelectedId(null)
                    setPinnedId(null)
                  }}
                />
              </g>
            )
          })}

          {/* nodes */}
          {filteredNodes.map((n) => {
            const active = n.id === selectedId
            const isMatch = matches.has(n.id)
            const isFocused = focusId ? focusId === n.id : false
            const isNeighbor = focusId ? neighborMap.get(focusId)?.has(n.id) : false
            const dim = focusId ? !(isFocused || isNeighbor) : false

            const r = active ? 18 : isMatch ? 16 : 14
            const fill = active ? '#0369a1' : isMatch ? '#0284c7' : '#0ea5e9'

            return (
              <g
                key={n.id}
                transform={`translate(${n.x ?? 0}, ${n.y ?? 0})`}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setSelectedId(n.id)
                  setPinnedId((prev) => (prev === n.id ? null : n.id))
                  setSelectedEdgeKey(null)
                }}
                onDoubleClick={() => {
                  setSelectedId(n.id)
                  setPinnedId(n.id)
                  onOpenPrinciple?.(n.principle)
                }}
                onMouseEnter={() => setHoverId(n.id)}
                onMouseLeave={() => setHoverId(null)}
                opacity={dim ? 0.18 : 1}
              >
                <circle r={r} fill={fill} opacity={0.92} />
                <circle r={r + 2} fill="transparent" stroke="rgba(255,255,255,0.55)" strokeWidth={active ? 2 : 1} />
                <text x={r + 10} y={5} fontSize={12} fill="#0f172a">
                  {n.title}
                </text>
              </g>
            )
          })}
        </svg>
        </div>

        {/* Insight panel */}
        <div className="rounded-2xl bg-white/75 border border-white/40 backdrop-blur-md shadow-md p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">Insights</div>
              <div className="text-sm text-gray-600 mt-1">
                Click a node to focus, double‑click to open the reader. Click an edge to see why it connects.
              </div>
            </div>
            {(selectedNode || selectedEdge) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedId(null)
                  setPinnedId(null)
                  setSelectedEdgeKey(null)
                }}
                className="p-2 rounded-xl hover:bg-white/70 text-gray-600 hover:text-gray-900 transition"
                aria-label="Clear selection"
              >
                <FiX />
              </button>
            )}
          </div>

          {!selectedNode && !selectedEdge && (
            <div className="mt-4 text-sm text-gray-700">
              <div className="font-semibold mb-2">How to use this map</div>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Raise <span className="font-semibold">Strength</span> to reduce noise.</li>
                <li>Use <span className="font-semibold">Keywords</span> edges to find semantic clusters.</li>
                <li>Hover a node to highlight its neighborhood.</li>
              </ul>
            </div>
          )}

          {selectedEdge && (
            <div className="mt-4">
              <div className="flex items-center gap-2 text-gray-900 font-bold">
                <FiLink2 className="text-primary-600" />
                Why these connect
              </div>
              <div className="mt-2 text-sm text-gray-700">
                <div className="font-semibold">
                  {(nodes.find((n) => n.id === selectedEdge.a)?.title || '—')} ↔ {(nodes.find((n) => n.id === selectedEdge.b)?.title || '—')}
                </div>
                <div className="text-gray-600 mt-1">Strength: {selectedEdge.weight} / 5</div>
              </div>

              <div className="mt-3 space-y-2 text-sm text-gray-800">
                {selectedEdge.types.includes('keywords') && (
                  <div>
                    <span className="font-semibold" style={{ color: '#059669' }}>Keywords</span>
                    {selectedEdge.sharedKeywords.length ? (
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selectedEdge.sharedKeywords.map((k) => (
                          <span key={k} className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-semibold">
                            {k}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-600 mt-1">Low overlap (still connected for context).</div>
                    )}
                  </div>
                )}
                {selectedEdge.types.includes('category') && (
                  <div>
                    <span className="font-semibold" style={{ color: '#0284c7' }}>Same category</span>
                  </div>
                )}
                {selectedEdge.types.includes('author') && (
                  <div>
                    <span className="font-semibold" style={{ color: '#7c3aed' }}>Same author</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedNode && (
            <div className="mt-4">
              <div className="text-gray-900 font-bold text-lg leading-tight">{selectedNode.title}</div>
              <div className="mt-2 text-sm text-gray-700 space-y-1">
                {selectedNode.category && (
                  <div>
                    <span className="font-semibold text-gray-600">Category:</span> {selectedNode.category}
                  </div>
                )}
                {selectedNode.author && (
                  <div>
                    <span className="font-semibold text-gray-600">Author:</span> {selectedNode.author}
                  </div>
                )}
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => onOpenPrinciple?.(selectedNode.principle)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition"
                >
                  <FiExternalLink />
                  Open reader
                </button>
                <button
                  type="button"
                  onClick={() => setPinnedId((prev) => (prev ? null : selectedNode.id))}
                  className="px-3 py-2 rounded-xl bg-white/80 border border-white/70 text-gray-800 font-semibold hover:bg-white transition"
                >
                  {pinnedId ? 'Unpin' : 'Pin'}
                </button>
              </div>

              <div className="mt-5">
                <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Top related
                </div>
                {relatedList.length === 0 ? (
                  <div className="text-sm text-gray-600">No related principles found.</div>
                ) : (
                  <div className="space-y-2">
                    {relatedList.map(({ other, meta }) => (
                      <button
                        key={`${meta.a}__${meta.b}`}
                        type="button"
                        onClick={() => {
                          setSelectedId(other.id)
                          setPinnedId(other.id)
                          setSelectedEdgeKey(null)
                        }}
                        className="w-full text-left p-3 rounded-2xl bg-white/70 border border-white/60 hover:bg-white transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-gray-900">{other.title}</div>
                            <div className="text-xs text-gray-600 mt-1">
                              Strength {meta.weight}/5 •{' '}
                              {meta.types.includes('keywords') ? 'keywords' : ''}{meta.types.includes('category') ? `${meta.types.includes('keywords') ? ', ' : ''}category` : ''}{meta.types.includes('author') ? `${(meta.types.includes('keywords') || meta.types.includes('category')) ? ', ' : ''}author` : ''}
                            </div>
                            {meta.sharedKeywords.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {meta.sharedKeywords.slice(0, 4).map((k) => (
                                  <span key={k} className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 text-[11px] font-semibold">
                                    {k}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-xs font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                            #{meta.weight}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-600">
        Tip: raise the Strength slider to reduce noise. “Keywords” edges show semantic similarity.
      </div>
    </div>
  )
}

