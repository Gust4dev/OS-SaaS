import { Decimal } from '@prisma/client/runtime/library';
import SuperJSON from 'superjson';

SuperJSON.registerCustom<Decimal, string>(
    {
        isApplicable: (v): v is Decimal => Decimal.isDecimal(v),
        serialize: v => v.toJSON(),
        deserialize: v => new Decimal(v),
    },
    'decimal.js'
);
