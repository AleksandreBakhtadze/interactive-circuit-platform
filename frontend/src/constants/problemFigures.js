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
    'CP.L2.12': [
        {
            src: '/problems/CP.L2.12/board.png',
            altKa: 'CP.L2.12 წრედი ფირზე',
            altEn: 'CP.L2.12 board circuit',
            captionKa: 'საცნობარო წრედი ფირზე',
            captionEn: 'Reference board layout',
        },
        {
            src: '/problems/CP.L2.12/schematic.png',
            altKa: 'CP.L2.12 სქემა',
            altEn: 'CP.L2.12 schematic',
            captionKa: 'სქემა',
            captionEn: 'Schematic',
        },
    ],
    'CP.L2.16': [
        {
            src: '/problems/CP.L2.16/board.png',
            altKa: 'CP.L2.16 წრედი ფირზე',
            altEn: 'CP.L2.16 board circuit',
            captionKa: 'საცნობარო წრედი ფირზე',
            captionEn: 'Reference board layout',
        },
    ],
};

export function getFiguresForProblem(problemCode) {
    return PROBLEM_FIGURES[problemCode] ?? [];
}
