import { Controller, Get, Res } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Response } from 'express';
import { DataSource } from 'typeorm';

interface CheckResult {
  status: 'ok' | 'error';
  latencyMs?: number;
  error?: string;
}

interface HealthResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  checks?: Record<string, CheckResult>;
}

@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  async getHealth(@Res() res: Response): Promise<void> {
    await this.sendFullCheck(res);
  }

  @Get('live')
  getLiveness(@Res() res: Response): void {
    const body: HealthResponse = { status: 'ok', timestamp: new Date().toISOString() };
    res.status(200).json(body);
  }

  @Get('ready')
  async getReadiness(@Res() res: Response): Promise<void> {
    await this.sendFullCheck(res);
  }

  private async sendFullCheck(res: Response): Promise<void> {
    const db = await this.checkDatabase();
    const allOk = db.status === 'ok';

    const body: HealthResponse = {
      status: allOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: { database: db },
    };

    res.status(allOk ? 200 : 503).json(body);
  }

  private async checkDatabase(): Promise<CheckResult> {
    const start = Date.now();
    try {
      await this.dataSource.query('SELECT 1');
      return { status: 'ok', latencyMs: Date.now() - start };
    } catch (err) {
      return {
        status: 'error',
        latencyMs: Date.now() - start,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }
}
