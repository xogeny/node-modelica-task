import { omSimulate } from './om';
import { Result } from './result';

export function simulate(source: string): Promise<Result> {
    return omSimulate(source);
}