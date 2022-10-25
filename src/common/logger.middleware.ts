import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Middlaware used in every request, with the purpose of to create a traceID and put on the request,
 * to be avaiable in Controllers.
 *
 * @param req 
 * @param res 
 * @param next 
 */
export function logger(req: Request, res: Response, next: NextFunction) {
    req["generatedTraceID"] = uuidv4()
    next();
};