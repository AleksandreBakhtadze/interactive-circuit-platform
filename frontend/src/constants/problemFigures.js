/**
 * Optional figures shown under the challenge brief (task condition).
 * Paths are under frontend/public.
 */
export const PROBLEM_FIGURES = {
    'CP.L2.5': [
        {
            src: '/problems/CP.L2.5/board.png',
            altKa: 'CP.L2.5 წრედი ფირზე',
            altEn: 'CP.L2.5 board circuit',
            captionKa: 'საცნობარო წრედი ფირზე',
            captionEn: 'Reference board layout',
        },
        {
            src: '/problems/CP.L2.5/schematic.png',
            altKa: 'CP.L2.5 სქემა',
            altEn: 'CP.L2.5 schematic',
            captionKa: 'სქემა',
            captionEn: 'Schematic',
        },
    ],
    'CP.L2.6': [
        {
            src: '/problems/CP.L2.6/board.png',
            altKa: 'CP.L2.6 წრედი ფირზე',
            altEn: 'CP.L2.6 board circuit',
            captionKa: 'საცნობარო წრედი ფირზე',
            captionEn: 'Reference board layout',
        },
        {
            src: '/problems/CP.L2.6/schematic.png',
            altKa: 'CP.L2.6 სქემა',
            altEn: 'CP.L2.6 schematic',
            captionKa: 'სქემა',
            captionEn: 'Schematic',
        },
    ],
    'CP.L2.7': [
        {
            src: '/problems/CP.L2.7/board.png',
            altKa: 'CP.L2.7 წრედი ფირზე',
            altEn: 'CP.L2.7 board circuit',
            captionKa: 'საცნობარო წრედი ფირზე',
            captionEn: 'Reference board layout',
        },
        {
            src: '/problems/CP.L2.7/schematic.png',
            altKa: 'CP.L2.7 სქემა',
            altEn: 'CP.L2.7 schematic',
            captionKa: 'სქემა',
            captionEn: 'Schematic',
        },
    ],
    'LR.L2.13': [
        {
            src: '/problems/LR.L2.13/board.png',
            altKa: 'LR.L2.13 წრედი ფირზე',
            altEn: 'LR.L2.13 board circuit',
            captionKa: 'საცნობარო წრედი ფირზე',
            captionEn: 'Reference board layout',
        },
        {
            src: '/problems/LR.L2.13/schematic.png',
            altKa: 'LR.L2.13 სქემა',
            altEn: 'LR.L2.13 schematic',
            captionKa: 'სქემა',
            captionEn: 'Schematic',
        },
    ],
    'LR.L2.14': [
        {
            src: '/problems/LR.L2.14/board.png',
            altKa: 'LR.L2.14 წრედი ფირზე',
            altEn: 'LR.L2.14 board circuit',
            captionKa: 'საცნობარო წრედი ფირზე',
            captionEn: 'Reference board layout',
        },
        {
            src: '/problems/LR.L2.14/schematic.png',
            altKa: 'LR.L2.14 სქემა',
            altEn: 'LR.L2.14 schematic',
            captionKa: 'სქემა',
            captionEn: 'Schematic',
        },
    ],
    'LR.L2.15': [
        {
            src: '/problems/LR.L2.15/board.png',
            altKa: 'LR.L2.15 წრედი ფირზე',
            altEn: 'LR.L2.15 board circuit',
            captionKa: 'საცნობარო წრედი ფირზე',
            captionEn: 'Reference board layout',
        },
        {
            src: '/problems/LR.L2.15/schematic.png',
            altKa: 'LR.L2.15 სქემა',
            altEn: 'LR.L2.15 schematic',
            captionKa: 'სქემა',
            captionEn: 'Schematic',
        },
    ],
};

export function getFiguresForProblem(problemCode) {
    return PROBLEM_FIGURES[problemCode] ?? [];
}
