import gpio from 'rpi-gpio';

async function onChange(pin: number, pinValue: boolean) {
    console.log(`Pin ${pin} is now ${pinValue} `);

    if (pin === 13) {
        console.log(`Writing ${pinValue} to pin 15`);
        gpio.write(15, pinValue, (err) => {
            if (err) {
                console.log(`Error writing to pin: ${err}`);
            }
        });
    }
}

async function readPin(pin: number) {
    console.log(`setup ${pin}`);
    await gpio.promise.setup(pin, gpio.DIR_IN, gpio.EDGE_BOTH);

    const value = await gpio.promise.read(pin);
    console.log(`Pin ${pin} is currently  ${value}`);
}

async function setup() {
    gpio.on('change', onChange);

    readPin(7);
    readPin(11);
    readPin(13);
}

console.log(`setup ${15}`);
gpio.setup(15, gpio.DIR_LOW, setup);
