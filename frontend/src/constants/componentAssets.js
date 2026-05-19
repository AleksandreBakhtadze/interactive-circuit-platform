/** Public URLs for Draw.io exports in frontend/public/components/ */
import { CONNECTOR_LENGTHS, connectorType } from './componentCatalog';

export const BOARD_IMAGE = '/components/board.svg';

const CONNECTOR_IMAGES = Object.fromEntries(
    CONNECTOR_LENGTHS.map((n) => [connectorType(n), `/components/connector${n}.svg`])
);

export const COMPONENT_IMAGES = {
    power_supply: '/components/power-supply.svg',
    button: '/components/button.svg',
    lamp: '/components/lamp.svg',
    ...CONNECTOR_IMAGES,
};

export function getComponentImage(type) {
    return COMPONENT_IMAGES[type] ?? null;
}
