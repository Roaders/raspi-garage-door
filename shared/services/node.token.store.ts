import { IAuthToken } from '../contracts';
import { ITokenStore } from '../contracts';

export class NodeTokenStore implements ITokenStore {
    public token: IAuthToken | undefined;
}
