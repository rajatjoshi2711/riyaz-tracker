import type { TopRaag } from "@/lib/apiClient";

const WIDTH = 720;
const HEIGHT = 360;
const MARGIN = { top: 36, right: 16, bottom: 84, left: 16 };

function packColumn(count: number, colWidth: number) {
  const r = Math.max(4, Math.min(9, colWidth / 7));
  const gap = r * 0.5;
  const padding = r * 1.2;
  const maxPerRow = Math.max(1, Math.floor((colWidth - padding * 2) / (2 * r + gap)));
  const rowHeight = r * 1.8;

  const points: { x: number; y: number }[] = [];
  let placed = 0;
  let row = 0;
  while (placed < count) {
    const remaining = count - placed;
    const inRow = Math.min(maxPerRow, remaining);
    const stagger = row % 2 === 1 ? r * 0.5 : 0;
    const rowSpan = (inRow - 1) * (2 * r + gap);
    const startX = -rowSpan / 2 + stagger;
    for (let i = 0; i < inRow; i++) {
      points.push({ x: startX + i * (2 * r + gap), y: -row * rowHeight - r });
    }
    placed += inRow;
    row++;
  }
  return { points, r };
}

export default function TopRaagsBeeswarm({ raags }: { raags: TopRaag[] }) {
  if (raags.length === 0) {
    return <p className="ef-caption">No sessions logged yet — practice counts will show up here.</p>;
  }

  const plotWidth = WIDTH - MARGIN.left - MARGIN.right;
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const baselineY = MARGIN.top + plotHeight;
  const colWidth = plotWidth / raags.length;
  const maxCount = Math.max(...raags.map((r) => r.count));

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Top practiced raags">
      <line
        x1={MARGIN.left}
        y1={baselineY}
        x2={WIDTH - MARGIN.right}
        y2={baselineY}
        stroke="var(--border)"
        strokeWidth={1}
      />
      {raags.map((raag, i) => {
        const colCenterX = MARGIN.left + colWidth * (i + 0.5);
        const { points, r } = packColumn(raag.count, colWidth);
        const clusterHeight = Math.max(...points.map((p) => -p.y)) + r;
        const scale = clusterHeight > plotHeight ? plotHeight / clusterHeight : 1;

        return (
          <g key={raag.raagId}>
            {points.map((p, pi) => (
              <circle
                key={pi}
                cx={colCenterX + p.x * scale}
                cy={baselineY + p.y * scale}
                r={r * scale}
                fill="var(--blue-500)"
                fillOpacity={0.85}
                stroke="#fff"
                strokeWidth={1}
              />
            ))}
            <text
              x={colCenterX}
              y={baselineY - clusterHeight * scale - 10}
              textAnchor="middle"
              className="ef-caption"
              fill="var(--text-secondary)"
              fontWeight={700}
            >
              {raag.count}
            </text>
            <text
              x={colCenterX}
              y={baselineY + 16}
              textAnchor="end"
              className="ef-caption"
              fill="var(--text-primary)"
              transform={`rotate(-40 ${colCenterX} ${baselineY + 16})`}
            >
              <title>{raag.name}</title>
              {raag.name.length > 16 ? `${raag.name.slice(0, 15)}…` : raag.name}
            </text>
          </g>
        );
      })}
      <text
        x={MARGIN.left}
        y={16}
        className="ef-caption"
        fill="var(--text-secondary)"
      >
        Times practiced (max {maxCount})
      </text>
    </svg>
  );
}
