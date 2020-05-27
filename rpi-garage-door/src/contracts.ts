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
    /**
     * some relays require false to be turned on.
     * defaults to false
     * setting this to true means that the relay pin will be set high most of the time and to press the button the pin will be set low
     */
    invertRelayControl: boolean;
}
