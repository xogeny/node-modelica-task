import { omSimulate } from './om';
import { Result } from './result';

export function simulate(model: string, source: string, stopTime: number): Promise<Result> {
    return omSimulate(model, source, stopTime);
}