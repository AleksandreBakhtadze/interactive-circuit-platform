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
        icon: 'dc-supply',
    },
    LR: {
        accent: '#f5d76e',
        iconBg: 'rgba(245, 215, 110, 0.22)',
        difficulty: 'beginner',
        icon: 'led',
    },
    SW: {
        accent: '#60c5f1',
        iconBg: 'rgba(96, 197, 241, 0.2)',
        difficulty: 'beginner',
        icon: 'spdt',
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
    PR: {
        accent: '#fcd34d',
        iconBg: 'rgba(252, 211, 77, 0.22)',
        difficulty: 'intermediate',
        icon: 'ldr',
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
    TCP: {
        accent: '#67e8f9',
        iconBg: 'rgba(103, 232, 249, 0.2)',
        difficulty: 'advanced',
        icon: 'transistor-cap',
    },
    DTR: {
        accent: '#fb7185',
        iconBg: 'rgba(251, 113, 133, 0.2)',
        difficulty: 'advanced',
        icon: 'darlington',
    },
    TFB: {
        accent: '#fbbf24',
        iconBg: 'rgba(251, 191, 36, 0.2)',
        difficulty: 'advanced',
        icon: 'feedback',
    },
    TDM: {
        accent: '#34d399',
        iconBg: 'rgba(52, 211, 153, 0.2)',
        difficulty: 'advanced',
        icon: 'transistor-motor',
    },
    GEN: {
        accent: '#818cf8',
        iconBg: 'rgba(129, 140, 248, 0.22)',
        difficulty: 'advanced',
        icon: 'bulb',
    },
};

const DEFAULT_META = {
    accent: '#60c5f1',
    iconBg: 'rgba(96, 197, 241, 0.18)',
    difficulty: 'beginner',
    icon: 'dc-supply',
};

export function getChapterMeta(code) {
    const key = String(code ?? '').toUpperCase();
    const base = META[key] ?? DEFAULT_META;
    return {
        ...base,
        difficultyInfo: DIFFICULTY[base.difficulty] ?? DIFFICULTY.beginner,
    };
}

/**
 * Circuit-symbol icons matching the component-card style
 * (DC supply, LED, switch, pot, LDR, transistor, Darlington, composites, …).
 */
export function ChapterIcon({ name, color = 'currentColor' }) {
    const stroke = color;
    const common = {
        width: 24,
        height: 24,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke,
        strokeWidth: 1.25,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
    };

    switch (name) {
        /* DC supply / cell: capacitor-like plates, one longer */
        case 'dc-supply':
        case 'battery':
            return (
                <svg {...common}>
                    <path d="M2 12h6" />
                    <path d="M8 4.5v15" strokeWidth="1.6" />
                    <path d="M14 7.5v9" strokeWidth="1.8" />
                    <path d="M14 12h8" />
                </svg>
            );

        /* Zigzag resistor */
        case 'resistor':
            return (
                <svg {...common}>
                    <path d="M2 12h3l2-4 2.5 8 2.5-8 2.5 8 2-4h4" />
                </svg>
            );

        /* Two equal parallel plates */
        case 'capacitor':
            return (
                <svg {...common}>
                    <path d="M2 12h7" />
                    <path d="M9 5v14" strokeWidth="1.5" />
                    <path d="M15 5v14" strokeWidth="1.5" />
                    <path d="M15 12h7" />
                </svg>
            );

        /* LED: diode + small outgoing light arrows */
        case 'led':
            return (
                <svg {...common}>
                    <path d="M2.5 12h5" />
                    <path d="M7.5 8v8l7-4-7-4z" fill={stroke} stroke="none" />
                    <path d="M14.5 8v8" strokeWidth="1.4" />
                    <path d="M14.5 12H21.5" />
                    {/* small arrows pointing out / up-right */}
                    <path d="M16.2 7.2 18.4 5" strokeWidth="1.1" />
                    <path d="M17.6 5.6 18.4 5 17.8 4.3" strokeWidth="1.05" />
                    <path d="M17.6 8.6 19.8 6.4" strokeWidth="1.1" />
                    <path d="M19 7 19.8 6.4 19.2 5.7" strokeWidth="1.05" />
                </svg>
            );

        /* SPST open switch */
        case 'switch':
            return (
                <svg {...common}>
                    <path d="M2 12h3.5" />
                    <circle cx="7" cy="12" r="1.4" />
                    <path d="M8.4 11.2 16.5 6.5" />
                    <circle cx="17.5" cy="12" r="1.4" />
                    <path d="M19 12H22" />
                </svg>
            );

        /* Push-button NO */
        case 'button':
            return (
                <svg {...common}>
                    <path d="M2 14h4" />
                    <circle cx="7.5" cy="14" r="1.3" />
                    <circle cx="16.5" cy="14" r="1.3" />
                    <path d="M18 14h4" />
                    <path d="M7.5 10.2h9" strokeWidth="1.5" />
                    <path d="M12 10.2V6.5" />
                    <path d="M9.5 6.5h5" />
                </svg>
            );

        /* SPDT 3-contact switch */
        case 'spdt':
            return (
                <svg {...common}>
                    <path d="M2 12h3.5" />
                    <circle cx="7" cy="12" r="1.4" />
                    <path d="M8.3 11.3 15.5 6.8" />
                    <circle cx="17" cy="6.5" r="1.3" />
                    <circle cx="17" cy="17.5" r="1.3" />
                    <path d="M18.5 6.5H22" />
                    <path d="M18.5 17.5H22" />
                </svg>
            );

        /* Relay: coil + switch */
        case 'relay':
            return (
                <svg {...common}>
                    <path d="M2 14.5c1.2-2.5 2-2.5 3.2 0s2 2.5 3.2 0 2-2.5 3.2 0" />
                    <path d="M12.5 14.5h1.5" />
                    <path d="M14 8.5v7" strokeDasharray="2 1.5" />
                    <circle cx="16.5" cy="8.5" r="1.1" />
                    <path d="M17.5 8.2 21 5.5" />
                    <circle cx="21.5" cy="5.2" r="1" />
                    <circle cx="21.5" cy="12" r="1" />
                </svg>
            );

        /* NPN BJT: big circle, compact internals */
        case 'transistor':
            return (
                <svg {...common}>
                    <circle cx="12.5" cy="12" r="8.2" />
                    <path d="M9.8 7.2v9.6" strokeWidth="1.45" />
                    <path d="M9.8 9.4 16.2 6.2" />
                    <path d="M9.8 14.6 16.2 17.8" />
                    <path d="M14.4 16.7 16.2 17.8 15.1 19.1" strokeWidth="1.15" />
                    <path d="M3.8 12h6" />
                </svg>
            );

        /* PN junction diode */
        case 'diode':
            return (
                <svg {...common}>
                    <path d="M2.5 12h5.5" />
                    <path d="M8 7.5v9l7.5-4.5L8 7.5z" fill={stroke} stroke="none" />
                    <path d="M15.5 7.5v9" strokeWidth="1.4" />
                    <path d="M15.5 12H21.5" />
                </svg>
            );

        /*
         * Variable resistor: zigzag lower; wiper high enough
         * that the arrow tip clears the zig peaks.
         */
        case 'pot':
            return (
                <svg {...common}>
                    <path d="M2 16h2.8l1.6-3.2 2 6.2 2-6.2 2 6.2 1.6-3H20" />
                    <path d="M20 16V4.5H12.2" />
                    <path d="M12.2 4.5v5.8" />
                    <path d="M10.7 8.8 12.2 10.6 13.7 8.8" strokeWidth="1.15" />
                </svg>
            );

        /* LDR: circle + zigzag; small arrows pointing inward */
        case 'ldr':
            return (
                <svg {...common}>
                    <text
                        x="4.2"
                        y="5"
                        fill={stroke}
                        stroke="none"
                        fontSize="3.6"
                        fontFamily="system-ui, sans-serif"
                        fontWeight="700"
                        textAnchor="start"
                    >
                        LDR
                    </text>
                    <path d="M2 14.5h3" />
                    <circle cx="12" cy="14.5" r="5.6" />
                    <path d="M19 14.5h3" />
                    <path d="M7.4 14.5h1.1l1-2.2 1.4 4.4 1.4-4.4 1 2.2H16.6" />
                    {/* small arrows coming in toward the circle */}
                    <path d="M19.6 5.2 17.4 7.4" strokeWidth="1.1" />
                    <path d="M17.4 6.5 17.4 7.4 18.3 7.4" strokeWidth="1.05" />
                    <path d="M21.2 6.6 19 8.8" strokeWidth="1.1" />
                    <path d="M19 7.9 19 8.8 19.9 8.8" strokeWidth="1.05" />
                </svg>
            );

        /* Lamp: circle with X (filament) */
        case 'bulb':
            return (
                <svg {...common}>
                    <path d="M2 12h4" />
                    <circle cx="12" cy="12" r="6.5" />
                    <path d="M8.2 8.2 15.8 15.8" />
                    <path d="M15.8 8.2 8.2 15.8" />
                    <path d="M18 12h4" />
                </svg>
            );

        /* Motor: circle with smaller M */
        case 'motor':
            return (
                <svg {...common}>
                    <path d="M2 12h3.2" />
                    <circle cx="12" cy="12" r="7.6" />
                    <text
                        x="12"
                        y="15.4"
                        fill={stroke}
                        stroke="none"
                        fontSize="9"
                        fontFamily="system-ui, sans-serif"
                        fontWeight="700"
                        textAnchor="middle"
                    >
                        M
                    </text>
                    <path d="M18.8 12H22" />
                </svg>
            );

        /*
         * Darlington — clean single transistor (same look as TR)
         * plus a small "2" to mark the cascaded pair.
         */
        case 'darlington':
            return (
                <svg {...common} strokeWidth="1.2">
                    <circle cx="11.2" cy="12" r="7.6" />
                    <path d="M3.2 12h5.2" />
                    <path d="M8.4 7.8v8.4" strokeWidth="1.4" />
                    <path d="M8.4 9.6 14.2 6.6" />
                    <path d="M8.4 14.4 14.2 17.4" />
                    <path d="M12.6 16.4 14.2 17.4 13.2 18.6" strokeWidth="1.1" />
                    <text
                        x="19.2"
                        y="18.8"
                        fill={stroke}
                        stroke="none"
                        fontSize="7"
                        fontFamily="system-ui, sans-serif"
                        fontWeight="800"
                        textAnchor="middle"
                    >
                        2
                    </text>
                </svg>
            );

        /* Feedback loop G / H (TFB) */
        case 'feedback':
            return (
                <svg {...common} strokeWidth="1.15">
                    <rect x="7.5" y="4.5" width="9" height="6" rx="0.6" />
                    <rect x="7.5" y="14" width="9" height="6" rx="0.6" />
                    <text
                        x="12"
                        y="8.7"
                        fill={stroke}
                        stroke="none"
                        fontSize="4.4"
                        fontFamily="system-ui, sans-serif"
                        fontWeight="700"
                        textAnchor="middle"
                    >
                        G
                    </text>
                    <text
                        x="12"
                        y="18.2"
                        fill={stroke}
                        stroke="none"
                        fontSize="4.4"
                        fontFamily="system-ui, sans-serif"
                        fontWeight="700"
                        textAnchor="middle"
                    >
                        H
                    </text>
                    <path d="M2.5 7.5H7.5" />
                    <path d="M16.5 7.5H21.5" />
                    <path d="M19.5 7.5v6.5H16.5" />
                    <path d="M7.5 17H4.5V7.5" />
                    <circle cx="7.5" cy="7.5" r="0.85" fill={stroke} stroke="none" />
                    <circle cx="16.5" cy="17" r="0.85" fill={stroke} stroke="none" />
                </svg>
            );

        /* Transistor + capacitor composite (TCP) */
        case 'transistor-cap':
            return (
                <svg {...common} strokeWidth="1.2">
                    <circle cx="8.2" cy="12" r="6.2" />
                    <path d="M6.4 8.2v7.6" strokeWidth="1.35" />
                    <path d="M6.4 9.8 11.2 7.2" />
                    <path d="M6.4 14.2 11.2 16.8" />
                    <path d="M9.8 15.7 11.2 16.8 10.3 18" strokeWidth="1.1" />
                    <path d="M2.2 12h4.2" />
                    <path d="M15.2 12h1.8" />
                    <path d="M17 6.8v10.4" strokeWidth="1.35" />
                    <path d="M20.4 6.8v10.4" strokeWidth="1.35" />
                    <path d="M20.4 12H22.5" />
                </svg>
            );

        /* Transistor + motor composite (TDM) — linked like TCP */
        case 'transistor-motor':
            return (
                <svg {...common} strokeWidth="1.2">
                    <circle cx="7.4" cy="12" r="5.8" />
                    <path d="M5.7 8.5v7" strokeWidth="1.35" />
                    <path d="M5.7 9.8 10.2 7.4" />
                    <path d="M5.7 14.2 10.2 16.6" />
                    <path d="M8.9 15.6 10.2 16.6 9.4 17.7" strokeWidth="1.1" />
                    <path d="M1.8 12h3.8" />
                    {/* connecting lead transistor → motor */}
                    <path d="M13.2 12h1.8" />
                    <circle cx="18.2" cy="12" r="4.4" />
                    <text
                        x="18.2"
                        y="14.1"
                        fill={stroke}
                        stroke="none"
                        fontSize="5.8"
                        fontFamily="system-ui, sans-serif"
                        fontWeight="700"
                        textAnchor="middle"
                    >
                        M
                    </text>
                    {/* motor output lead */}
                    <path d="M22.6 12H23.5" />
                </svg>
            );

        default:
            return (
                <svg {...common}>
                    <path d="M2 12h6" />
                    <path d="M8 4.5v15" strokeWidth="1.6" />
                    <path d="M14 7.5v9" strokeWidth="1.8" />
                    <path d="M14 12h8" />
                </svg>
            );
    }
}
