import { ColumnMajorResults } from './parsing';

export interface Request {
    model: string;
    source: string;
    stopTime: number;
}

export interface Result {
    results: ColumnMajorResults;
}