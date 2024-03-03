import { NextRequest, NextResponse } from "next/server";
import { analytics } from "./utils/analytics";

async function middleware(req: NextRequest) {

    switch (req.nextUrl.pathname) {
        case '/':
            try {
                analytics().track("pageview", {
                    page: '/',
                    country: req.geo?.country,
                });
            } catch (err) {
                // fail silently
                console.error(err)
            }
            break;
        case '/sx/15':
            try {
                analytics().track("pageview", {
                    page: '/sx/15',
                    country: req.geo?.country,
                })
                analytics().track("configurator" , {
                    configurator: 'sx15',
                    country: req.geo?.country,
                });
            } catch (err) {
                console.error(err);
            }
        break;
    }

    return NextResponse.next();
}

export const mathcer = {
    mathcer: ['/']
};

export default middleware;

