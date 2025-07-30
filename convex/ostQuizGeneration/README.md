# Ost Quiz Generation

### Randomize with indexes


```ts
import { DataModel } from "../_generated/dataModel";
import { components } from "../_generated/api";
import { TableAggregate } from "@convex-dev/aggregate";

const randomize = new TableAggregate<{
    Key: null;
    DataModel: DataModel;
    TableName: "ostQuestions";
}>(components.ostQuestions, {
    sortKey: (doc) => null,
});

// Function to shuffle array
function shuffle(array: any[], seed?: string) {
    if (seed) {
        // Simple deterministic shuffle based on seed
        const hash = seed.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.abs(hash + i) % (i + 1);
            [array[i], array[j]] = [array[j], array[i]];
        }
    } else {
        // Random shuffle
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    return array;
}

// Random selection using TableAggregate
// Not working now
export const getRandomQuestions = query({
    args: {
        offset: v.number(),
        quantity: v.number(),
        seed: v.optional(v.string()),
    },
    returns: v.array(v.any()),
    handler: async (ctx, { offset, quantity, seed }) => {
        const count = await randomize.count(ctx);

        const allIndexes = Array.from({ length: count }, (_, i) => i);
        shuffle(allIndexes, seed);
        const indexes = allIndexes.slice(offset, offset + quantity);

        const atIndexes = await Promise.all(
            indexes.map((i) => randomize.at(ctx, i))
        );

        return await Promise.all(
            atIndexes.map(async (atIndex) => {
                const doc = (await ctx.db.get(atIndex.id))!;
                return doc;
            })
        );
    },
});
```

### in internal query

```ts
        // TODO: randomize with indexes more efficient
        // const selectedQuestions = await ctx.runQuery(internal.ostQuizGeneration.ostQuizGeneration.getRandomQuestions, {
        //     offset: 0,
        //     quantity: args.questionCount,
        //     seed: "123"
        // });

```