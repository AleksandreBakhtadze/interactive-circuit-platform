/** Circular progress ring for chapter cards. */
export default function ProgressRing({
    value = 0,
    max = 1,
    size = 44,
    stroke = 4,
    color = '#43d9a2',
    track = 'rgba(255,255,255,0.12)',
}) {
    const pct = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const offset = c * (1 - pct);

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            aria-hidden
            style={{ display: 'block', transform: 'rotate(-90deg)' }}
        >
            <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={track}
                strokeWidth={stroke}
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={color}
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={c}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 0.45s ease' }}
            />
        </svg>
    );
}
