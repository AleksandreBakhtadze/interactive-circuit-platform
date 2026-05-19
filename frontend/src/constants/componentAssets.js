/** Public URLs for Draw.io exports in frontend/public/components/ */
export const BOARD_IMAGE = '/components/board.svg';

export const COMPONENT_IMAGES = {
    power_supply: '/components/power-supply.svg',
    button: '/components/button.svg',
    lamp: '/components/lamp.svg',
    wire3: '/components/wire3.svg',
};

export function getComponentImage(type) {
    return COMPONENT_IMAGES[type] ?? null;
}
