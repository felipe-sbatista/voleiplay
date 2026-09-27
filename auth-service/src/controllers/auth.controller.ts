import { Request, Response } from 'express';
import { authService, AuthService } from '../services/auth.service.js';

export class AuthController {
  constructor(private service: AuthService = authService) {}

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'E-mail e senha são obrigatórios.'
        });
      }

      const session = await this.service.login({ email, password });
      res.status(200).json({
        success: true,
        token: session.token,
        user: session.user,
        expiresAt: session.expiresAt
      });
    } catch (err: any) {
      res.status(401).json({
        success: false,
        error: err.message
      });
    }
  };

  register = async (req: Request, res: Response) => {
    try {
      const session = await this.service.register(req.body);
      res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso.',
        token: session.token,
        user: session.user,
        expiresAt: session.expiresAt
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  };

  me = (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          error: 'Token de autorização ausente no cabeçalho Authorization.'
        });
      }

      const user = this.service.validateToken(authHeader);
      res.status(200).json({
        success: true,
        user
      });
    } catch (err: any) {
      res.status(401).json({
        success: false,
        error: err.message
      });
    }
  };

  logout = (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      this.service.logout(authHeader);
    }
    res.status(200).json({
      success: true,
      message: 'Sessão encerrada com sucesso.'
    });
  };

  listUsers = (req: Request, res: Response) => {
    const users = this.service.listUsers();
    res.status(200).json({
      success: true,
      total: users.length,
      users
    });
  };

  stats = (req: Request, res: Response) => {
    const stats = this.service.getStats();
    res.status(200).json({
      success: true,
      stats
    });
  };

  health = (req: Request, res: Response) => {
    res.status(200).json({
      service: 'Voleiplay Auth Microservice',
      status: 'UP',
      port: process.env.PORT || 3007,
      timestamp: new Date().toISOString()
    });
  };
}

export const authController = new AuthController();
