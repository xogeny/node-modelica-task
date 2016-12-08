import { omSimulate } from './om';
import { Result } from './result';

export function simulate(model: string, source: string): Promise<Result> {
    return omSimulate(model, source);
}