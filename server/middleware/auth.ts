import { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  isAuthenticated: boolean;
}

export function authenticateApiKey(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  const expectedApiKey = process.env.CRON_API_KEY || "cron_manager_api_key_2025";

  console.log('Auth Debug:', {
    receivedKey: apiKey ? `${String(apiKey).substring(0, 10)}...` : 'none',
    expectedKey: expectedApiKey ? `${expectedApiKey.substring(0, 10)}...` : 'none',
    match: apiKey === expectedApiKey
  });

  if (!apiKey) {
    return res.status(401).json({ 
      error: "Chave API necessária",
      message: "Forneça a chave API no header 'X-API-Key' ou parâmetro 'apiKey'" 
    });
  }

  if (apiKey !== expectedApiKey) {
    return res.status(403).json({ 
      error: "Chave API inválida",
      message: "A chave API fornecida não é válida" 
    });
  }

  req.isAuthenticated = true;
  next();
}
