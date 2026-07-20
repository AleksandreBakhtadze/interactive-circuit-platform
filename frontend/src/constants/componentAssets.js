/** Public URLs for Draw.io exports in frontend/public/components/ */
import {
    CAPACITOR_SPECS,
    capacitorType,
    CONNECTOR_LENGTHS,
    connectorType,
    LED_SPECS,
    ledType,
    RESISTOR_SPECS,
    resistorType,
    TRANSISTOR_SPECS,
    transistorType,
} from './componentCatalog';

export const BOARD_IMAGE = '/components/board.svg';

const CONNECTOR_IMAGES = Object.fromEntries(
    CONNECTOR_LENGTHS.map((n) => [connectorType(n), `/components/connector${n}.svg`])
);

const RESISTOR_IMAGES = Object.fromEntries(
    RESISTOR_SPECS.map((s) => [
        resistorType(s.key),
        `/components/${s.file}`,
    ])
);

const LED_IMAGES = Object.fromEntries(
    LED_SPECS.map((s) => [ledType(s.key), `/components/${s.file}`])
);

const CAPACITOR_IMAGES = Object.fromEntries(
    CAPACITOR_SPECS.map((s) => [
        capacitorType(s.key),
        `/components/${s.file}`,
    ])
);

const TRANSISTOR_IMAGES = Object.fromEntries(
    TRANSISTOR_SPECS.map((s) => [
        transistorType(s.key),
        `/components/${s.file}`,
    ])
);

export const COMPONENT_IMAGES = {
    power_supply: '/components/power-supply.svg',
    button: '/components/button.svg',
    lamp: '/components/lamp.svg',
    switch: '/components/switch.svg',
    motor: '/components/motor.svg',
    diode: '/components/diode.svg',
    relay: '/components/relay.svg',
    slide_switch: '/components/slide-switch-ab.svg',
    var_resistor: '/components/var-resistor-10k.svg',
    photo_resistor: '/components/photo-resistor.svg',
    torch: '/components/torch.svg',
    cover: '/components/cover.svg',
    ...CONNECTOR_IMAGES,
    ...RESISTOR_IMAGES,
    ...CAPACITOR_IMAGES,
    ...TRANSISTOR_IMAGES,
    ...LED_IMAGES,
};

export function getComponentImage(type) {
    return COMPONENT_IMAGES[type] ?? null;
}
