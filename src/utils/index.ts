import { format, subDays } from 'date-fns';
import { RetrieveDaysPromise } from './analytics';

export function getDate(sub: number = 0) {
    const dateXDaysAgo  = subDays(new Date(), sub);
    return format(dateXDaysAgo, "dd/MM/yyyy");
}

export function countTotal(data: Awaited<RetrieveDaysPromise>) {
    return data.reduce((acc, cur) => {
        return (acc + cur.events.reduce((acc, cur) => {
            return (acc + Object.values(cur)[0]!)
        }, 0))
    }, 0);
}

export function countSpecificTotal(data: Awaited<RetrieveDaysPromise>, t: string) {
    return data.reduce((acc, cur) => {
        return (acc + cur.events.filter(a => {
            return Object.values(JSON.parse(Object.keys(a)[0]!))[0] === t
        }).reduce((acc, cur) => {
            return (acc + Object.values(cur)[0]!)
        }, 0))
    }, 0);
}
