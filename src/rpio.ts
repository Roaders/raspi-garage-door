import { open, INPUT, OUTPUT, read, poll, write } from 'rpio';

function onChange(pin: number) {
    const pinValue = read(pin);
    console.log(`Pin ${pin} is now ${pinValue} `);

    if (pin === 13) {
        console.log(`Writing ${pinValue} to pin 15`);
        write(15, pinValue);
    }
}

function readPin(pin: number) {
    open(pin, INPUT);
    console.log(`Pin ${pin} is currently  ${read(pin)} `);

    poll(pin, onChange);
}

open(15, OUTPUT);

readPin(7);
readPin(11);
readPin(13);
