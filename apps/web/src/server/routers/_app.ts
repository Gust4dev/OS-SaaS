import { router } from '../trpc';
import { healthRouter } from './health';
import { customerRouter } from './customer';
import { vehicleRouter } from './vehicle';
import { serviceRouter } from './service';
import { productRouter } from './product';
import { orderRouter } from './order';

export const appRouter = router({
    health: healthRouter,
    customer: customerRouter,
    vehicle: vehicleRouter,
    service: serviceRouter,
    product: productRouter,
    order: orderRouter,
});

export type AppRouter = typeof appRouter;

