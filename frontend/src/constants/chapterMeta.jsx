/** Visual meta for chapter cards — icons, accent colours, difficulty. */

export const DIFFICULTY = {
    beginner: { key: 'beginner', ka: 'დამწყები', en: 'beginner', color: '#3ecf8e' },
    intermediate: {
        key: 'intermediate',
        ka: 'საშუალო',
        en: 'intermediate',
        color: '#f5a524',
    },
    advanced: { key: 'advanced', ka: 'რთული', en: 'advanced', color: '#f31260' },
};

const META = {
    ST: {
        accent: '#f5d76e',
        iconBg: 'rgba(245, 215, 110, 0.2)',
        difficulty: 'beginner',
        icon: 'battery',
    },
    LR: {
        accent: '#f5d76e',
        iconBg: 'rgba(245, 215, 110, 0.22)',
        difficulty: 'beginner',
        icon: 'resistor',
    },
    SW: {
        accent: '#60c5f1',
        iconBg: 'rgba(96, 197, 241, 0.2)',
        difficulty: 'beginner',
        icon: 'switch',
    },
    DM: {
        accent: '#43d9a2',
        iconBg: 'rgba(67, 217, 162, 0.2)',
        difficulty: 'beginner',
        icon: 'motor',
    },
    VR: {
        accent: '#ffb347',
        iconBg: 'rgba(255, 179, 71, 0.2)',
        difficulty: 'intermediate',
        icon: 'pot',
    },
    CP: {
        accent: '#7dd3c0',
        iconBg: 'rgba(125, 211, 192, 0.2)',
        difficulty: 'intermediate',
        icon: 'capacitor',
    },
    DI: {
        accent: '#c4b5fd',
        iconBg: 'rgba(196, 181, 253, 0.22)',
        difficulty: 'intermediate',
        icon: 'diode',
    },
    TR: {
        accent: '#f78fb3',
        iconBg: 'rgba(247, 143, 179, 0.2)',
        difficulty: 'intermediate',
        icon: 'transistor',
    },
    TRL: {
        accent: '#a78bfa',
        iconBg: 'rgba(167, 139, 250, 0.22)',
        difficulty: 'advanced',
        icon: 'relay',
    },
    TCP: {
        accent: '#67e8f9',
        iconBg: 'rgba(103, 232, 249, 0.2)',
        difficulty: 'advanced',
        icon: 'chip',
    },
    DTR: {
        accent: '#fb7185',
        iconBg: 'rgba(251, 113, 133, 0.2)',
        difficulty: 'advanced',
        icon: 'chip',
    },
    TFB: {
        accent: '#fbbf24',
        iconBg: 'rgba(251, 191, 36, 0.2)',
        difficulty: 'advanced',
        icon: 'wave',
    },
    TDM: {
        accent: '#34d399',
        iconBg: 'rgba(52, 211, 153, 0.2)',
        difficulty: 'advanced',
        icon: 'motor',
    },
    GEN: {
        accent: '#818cf8',
        iconBg: 'rgba(129, 140, 248, 0.22)',
        difficulty: 'advanced',
        icon: 'wave',
    },
};

const DEFAULT_META = {
    accent: '#60c5f1',
    iconBg: 'rgba(96, 197, 241, 0.18)',
    difficulty: 'beginner',
    icon: 'chip',
};

export function getChapterMeta(code) {
    const key = String(code ?? '').toUpperCase();
    const base = META[key] ?? DEFAULT_META;
    return {
        ...base,
        difficultyInfo: DIFFICULTY[base.difficulty] ?? DIFFICULTY.beginner,
    };
}

/** Tiny inline SVG icons (24×24 viewBox). */
export function ChapterIcon({ name, color = 'currentColor' }) {
    const stroke = color;
    const common = {
        width: 22,
        height: 22,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke,
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
    };

    switch (name) {
        case 'battery':
            return (
                <svg {...common}>
                    <rect x="3" y="7" width="16" height="10" rx="1.5" />
                    <path d="M19 10h2v4h-2" />
                    <path d="M8 10v4M12 10v4" />
                </svg>
            );
        case 'resistor':
            return (
                <svg {...common}>
                    <path d="M2 12h4l2-4 3 8 3-8 2 4h6" />
                </svg>
            );
        case 'switch':
            return (
                <svg {...common}>
                    <circle cx="6" cy="12" r="2.2" />
                    <circle cx="18" cy="12" r="2.2" />
                    <path d="M8 11.2 16 7.5" />
                </svg>
            );
        case 'motor':
            return (
                <svg {...common}>
                    <circle cx="12" cy="12" r="7" />
                    <circle cx="12" cy="12" r="2" />
                    <path d="M12 5v2M12 17v2M5 12h2M17 12h2" />
                </svg>
            );
        case 'pot':
            return (
                <svg {...common}>
                    <path d="M4 16 8 8l4 8 4-8 4 8" />
                    <circle cx="12" cy="14" r="1.6" fill={stroke} stroke="none" />
                </svg>
            );
        case 'capacitor':
            return (
                <svg {...common}>
                    <path d="M4 12h6M14 12h6M10 6v12M14 6v12" />
                </svg>
            );
        case 'diode':
            return (
                <svg {...common}>
                    <path d="M5 12h5" />
                    <path d="M10 7l7 5-7 5V7z" />
                    <path d="M17 7v10" />
                </svg>
            );
        case 'transistor':
            return (
                <svg {...common}>
                    <path d="M8 5v14" />
                    <path d="M8 10l8-4M8 14l8 4" />
                    <circle cx="8" cy="12" r="1.4" fill={stroke} stroke="none" />
                </svg>
            );
        case 'relay':
            return (
                <svg {...common}>
                    <rect x="4" y="8" width="10" height="8" rx="1" />
                    <path d="M14 12h6M17 9v6" />
                </svg>
            );
        case 'wave':
            return (
                <svg {...common}>
                    <path d="M3 12c2-6 4-6 6 0s4 6 6 0 4-6 6 0" />
                </svg>
            );
        case 'chip':
        default:
            return (
                <svg {...common}>
                    <rect x="7" y="7" width="10" height="10" rx="1.5" />
                    <path d="M10 4v3M14 4v3M10 17v3M14 17v3M4 10h3M4 14h3M17 10h3M17 14h3" />
                </svg>
            );
    }
}
