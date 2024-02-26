import { NextResponse, NextRequest } from "next/server";
import { Browser, chromium } from 'playwright'
import z from 'zod'


let browserContext: Browser | null = null;
let timeoutId: NodeJS.Timeout | null = null;

const idleTimeout = 2 * 60 * 1000; // 2 minutes

export async function GET(request: NextRequest) {

    console.log("starting operation")

    // check if browser is already running otherwise launch it
    if (!browserContext) await launchBrowser();

    let urls = request.nextUrl.searchParams.get('urls')
    let darkMode = request.nextUrl.searchParams.get('darkMode')
    let fullPage = request.nextUrl.searchParams.get('fullPage')
    let width = request.nextUrl.searchParams.get('width')
    let height = request.nextUrl.searchParams.get('height')

    // validate request params
    const paramsSchema = z.object({
        urls: z.string().url().array(),
        height: z.number().optional().default(1440),
        width: z.number().optional().default(1080),
        // timeout: z.number().max(15000).optional().default(15000), // max timeout is 15 seconds
        fullPage: z.boolean().optional().default(false),
        darkMode: z.boolean().optional().default(false),
    })

    const urlSchema = z.string().url()

    if (!urls?.toString().trim()) return NextResponse.json({ error: 'No url found' }, { status: 400 })

    // list of valid urls
    let validUrls: string[] = []

    // loop through urls and validate them
    urls.toString().split(',').forEach(url => {
        const parsedUrl = urlSchema.safeParse(url.trim())
        if (parsedUrl.success) validUrls.push(parsedUrl.data)
    })

    if (validUrls.length === 0) return NextResponse.json({ error: 'No valid url found' }, { status: 400 })


    const convertedHeight: number = parseInt(height as string) || 1440
    const convertedWidth: number = parseInt(width as string) || 1080

    // parse and validate request params
    const parsedParams = paramsSchema.safeParse({ urls: validUrls, height: convertedHeight, width: convertedWidth, fullPage: fullPage?.toString().toLowerCase() === 'true', darkMode: darkMode?.toString().toLowerCase() === 'true' })

    // throw error if request params are invalid
    if (parsedParams.success === false) return NextResponse.json({ error: parsedParams.error.errors[0].message }, { status: 400 })

    const images = await captureMultipleScreen({
        urls: parsedParams.data.urls,
        width: parsedParams.data.width,
        height: parsedParams.data.height,
        darkMode: parsedParams.data.darkMode,
        fullPage: parsedParams.data.fullPage,
        browserContext: browserContext!,
        timeout: 15000
    })

    return NextResponse.json({ results: images });
}


async function launchBrowser() {
    // console.log("launching browser")
    browserContext = await chromium.launch({
        headless: true,
    });

    resetIdleTimer();
}

function resetIdleTimer() {
    // console.log("resetting timer")
    // Clear the existing timer, if any
    if (timeoutId) clearTimeout(timeoutId);

    // Set a new timer
    timeoutId = setTimeout(async () => {
        if (browserContext) {
            await browserContext.close();
            browserContext = null;
        }
        // console.log("closing browser")
    }, idleTimeout);
}

interface ScreenshotOptions {

    urls: string[]
    width: number
    height: number
    timeout: number
    fullPage: boolean
    darkMode: boolean

    browserContext: Browser
}


async function captureMultipleScreen({ urls, width, height, darkMode, browserContext, timeout, fullPage }: ScreenshotOptions) {


    // create a new browser context
    const browser = await browserContext.newContext({
        viewport: {
            width: width,
            height: height
        }, colorScheme: darkMode ? 'dark' : 'light'

    })


    let listOfImages: string[] = []

    await Promise.all(urls.map(async (url, index) => {
        console.log(`${index + 1} of ${urls.length} - ${url}`)
        try {
            // open/create new page
            const page = await browser.newPage();

            // await page.goto(url,
            //     timeout ? { waitUntil: 'load', timeout: timeout }
            //         : { waitUntil: 'load' })
            //     .catch((err) => {
            //         throw Error(err);
            //     })

            await page.goto(url, { waitUntil: 'load' })
                .catch((err) => {
                    throw Error(err);
                })


            if (fullPage) {
                // scroll to trigger lazy loading
                await page.evaluate(() => {
                    return new Promise((resolve) => {
                        let totalHeight = 0;
                        let distance = window.innerHeight;
                        let timer = setInterval(() => {
                            let scrollHeight = document.body.scrollHeight;
                            window.scrollBy(0, distance);
                            totalHeight += distance;

                            if (totalHeight >= scrollHeight) {
                                clearInterval(timer);
                                resolve(console.log(''));
                            }
                        }, 200);
                    });
                });

                // scroll to top
                await page.evaluate(() => {
                    window.scrollTo(0, 0);
                });
            }

            // added delay for loading assets
            await page.waitForTimeout(2000);

            // capture screenshot
            let result = await page.screenshot({
                fullPage: fullPage,
            });

            console.log('screenshot captured: ', result.toString('base64').substring(0, 50))

            listOfImages.push(result.toString('base64'))

            // temp
            // listOfImages.push(result.toString('base64').substring(0, 50))

        } catch (err) {
            console.log(`error fetching ${url}: ${err}`)
            // console.log('Error:', err)
        }
    }))

    // ---- clean-up ----
    // response.on('finish', async () => {
    //     console.log("cleaning up function")
    //     await browser.close();
    // });

    return listOfImages;
}