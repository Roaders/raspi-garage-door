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
     * In 2 button mode this drives the close door button
     * defaults to 11 (BCM 17)
     */
    buttonPressRelayPin: number;
    /**
     * pin to drive open button press relay from
     * defaults to 12 (BCM 17)
     */
    openButtonPressRelayPin: number;
    /**
     * Turns on 2 button mode if your garage door opener has an open and close button
     * defaults to true
     */
    twoButtonMode: boolean;
    /**
     * pin to attach door open relay switch to
     * defaults to 13 (BCM 27)
     */
    doorOpenSwitchPin: number;
    /**
     * pin to attach door close relay swith to
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
    /**
     * The length of time (in ms) to wait before marking the door state as Unkown after a button press
     * Defaults to 30,000 (30 seconds)
     */
    doorTimeout: number;
}
