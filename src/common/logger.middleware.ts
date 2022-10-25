import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export function logger(req: Request, res: Response, next: NextFunction) {
    req["generatedTraceID"] = uuidv4()
    next();
};