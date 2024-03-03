import { redis } from "@/lib/redis";
import { getDate } from ".";
import { parse } from "date-fns";

interface AnalyticsArgs {
    retention?: number;
};

interface TrackOptions {
    persist?: boolean;
};

function Key(namespace: string) {
    return `analytics::${namespace}`;
}

export type RetrieveDaysPromise = Promise<{
    date: string;
    events: {
        [x: string]: number;
    }[];
}[]>;

const DEFAULT_RETENTION = 60*60*24*7;

export function analytics(topts?: AnalyticsArgs) {

    async function track(namespace: string, event: object = {}, opts?: TrackOptions) {
        let key = Key(namespace);

        if (!opts?.persist) {
            key += `::${getDate()}`;
        }
        
        // db call to persist this event
        await redis.hincrby(key, JSON.stringify(event), 1);

        if (!opts?.persist) {
            if (topts?.retention) {
                await redis.expire(key, topts.retention);
            } else {
                await redis.expire(key, DEFAULT_RETENTION);
            }
        }
    }

    async function retrieve(namespace: string, date: string) {
        const res = await redis.hgetall<Record<string, string>>(`${Key(namespace)}::${date}`);
        return {
            date,
            events: Object.entries(res ?? []).map(([key, value]) => {
                return {
                    [key]: Number(value)
                };
            }),
        }
    }

    async function retrieveDays(namespace: string, nDays: number) {
        type AnalyticsPromise = ReturnType<typeof retrieve>;
        const promises: AnalyticsPromise[] = [];
        for (let i = 0; i < nDays; ++i) {
            const formattedDate = getDate(i);
            const promise = analytics({}).retrieve(namespace, formattedDate);
            promises.push(promise);
        }
        const fetched  = await Promise.all(promises);
        const data = fetched.sort((a, b) => {
            if (parse(a.date, 'dd/MM/yyyy', new Date()) > parse(b.date, 'dd/MM/yyyy', new Date()) ) {
                return 1;
            } else {
                return -1;
            }
        });
        return data;
    }

    return {
        track,
        retrieve,
        retrieveDays,
    };
}
