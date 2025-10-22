import { Controller, DynamicModule, Get, Module } from '@nestjs/common';

export interface TrackingEntry {
  duration: number;
  status: 'success' | 'error';
}

export const monitorReportStore: Record<string, TrackingEntry[]> = {};

export function recordTracking(key: string, entry: TrackingEntry) {
  if (!monitorReportStore[key]) {
    monitorReportStore[key] = [];
  }
  monitorReportStore[key].push(entry);
}

export function getTrackingSummary() {
  return Object.entries(monitorReportStore).map(([key, entries]) => {
    const durations = entries.map((e) => e.duration);
    const total = durations.reduce((a, b) => a + b, 0);
    const avg = total / durations.length;
    const max = Math.max(...durations);
    const min = Math.min(...durations);
    const successCount = entries.filter((e) => e.status === 'success').length;
    const errorCount = entries.length - successCount;
    const last = entries[entries.length - 1];

    return {
      key,
      totalCalls: entries.length,
      successCount,
      errorCount,
      averageDurationMs: avg,
      maxDurationMs: max,
      minDurationMs: min,
      lastDurationMs: last.duration,
      lastStatus: last.status,
    };
  });
}

// export class MonitorConfig {

//   static config(app: INestApplication) {
//     const httpAdapter = app.getHttpAdapter();

//     httpAdapter.get('/monitor/report', (req: Request, res: Response) => {
//       const summary = getTrackingSummary();
//       res.json(summary);
//     });

//     console.log(`✔ Monitor endpoint /monitor/report registered`);
//   }
// }

export function Monitoring() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const className = target.constructor.name;
      const methodName = propertyKey;
      const key = `${className}:${methodName}`;
      const start = Date.now();
      try {
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - start;
        recordTracking(key, { duration, status: 'success' });
        return result;
      } catch (error) {
        const duration = Date.now() - start;
        recordTracking(key, { duration, status: 'error' });
        throw error;
      }
    };

    return descriptor;
  };
}

@Module({})
export class MonitorModule {
  static register(): DynamicModule {
    return {
      module: MonitorModule,
      controllers: [MonitorController],
    };
  }
}

@Controller('monitor')
export class MonitorController {
  @Get('report')
  getReport() {
    return getTrackingSummary();
  }
}
