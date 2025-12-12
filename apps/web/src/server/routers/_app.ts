import { router } from '../trpc';
import { healthRouter } from './health';
import { customerRouter } from './customer';
import { vehicleRouter } from './vehicle';

export const appRouter = router({
    health: healthRouter,
    customer: customerRouter,
    vehicle: vehicleRouter,
});

export type AppRouter = typeof appRouter;
