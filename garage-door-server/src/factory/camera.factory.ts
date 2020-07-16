import PiCamera from 'pi-camera';
import { join } from 'path';

export class PiCameraFactory {
    constructor(public readonly imagesFolder: string) {}

    create(fileName: string) {
        const output = join(this.imagesFolder, fileName);
        return new PiCamera({
            mode: 'photo',
            output,
        });
    }
}
