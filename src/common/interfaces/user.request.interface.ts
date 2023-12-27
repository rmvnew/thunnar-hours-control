
import { Request } from 'express';

export interface RequestWithUser extends Request {
    user: any; // ou defina um tipo mais específico se disponível
}
