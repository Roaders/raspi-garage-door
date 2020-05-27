export type UPDATE_DOOR_STATUS = 'OPEN' | 'CLOSED';
export type DOOR_STATUS = UPDATE_DOOR_STATUS | 'OPENING' | 'CLOSING' | 'UNKNOWN';

export interface IGarageDoorStatus<T extends UPDATE_DOOR_STATUS | DOOR_STATUS = DOOR_STATUS> {
    readonly status: T;
}

export type MODE = 'mode_rpi' | 'mode_bcm';

export interface IGarageDoorOptions {
    /**
     * how long to press the button for in ms
     * defaults to 1 second
     */
    buttonPressInterval: number;
    /**
     * Pin addressing method.
     * Defaults to 'mode_rpi'
     */
    pinAddressingMode: MODE;
    /**
     * pin to drive button press relay from
     * defaults to 11 (BCM 17)
     */
    buttonPressRelayPin: number;
    /**
     * pin to attach door open switch to
     * defaults to 13 (BCM 27)
     */
    doorOpenSwitchPin: number;
    /**
     * pin to attach door close pin to
     * defaults to 15 (BCM 22)
     */
    doorClosedSwitchPin: number;
    /**
     * amount of time to wait once a switch is triggered before updateing state in ms
     * defaults to 2 seconds
     */
    stateChangeDelay: number;
}
