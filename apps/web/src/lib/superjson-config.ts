import { Decimal } from 'decimal.js';
import SuperJSON from 'superjson';

SuperJSON.registerCustom<Decimal, string>(
    {
        isApplicable: (v): v is Decimal => Decimal.isDecimal(v),
        serialize: v => v.toString(),
        deserialize: v => new Decimal(v),
    },
    'decimal.js'
);

export default SuperJSON;
