import { NextResponse, NextRequest } from "next/server";


export async function POST(req: NextRequest, res: NextResponse) {

    const body = await req.json()

    let { height, width, fullPage, urls } = body
    if (!urls) return NextResponse.next({ status: 400 });

    width = parseInt(width) || 1440
    height = parseInt(height) || 1080
    fullPage = fullPage === "false" ? false : true

    // promise all settled
    const promises = urls.map(async (url: string) => {
        return await getScreenshot(url, width, height, fullPage)
    })

    let images: any = []

    await Promise.allSettled(promises)
        .then((results) => {
            // @ts-ignore
            images = results.map(res => res.value)
        })


    NextResponse.next({ status: 200 })
    return NextResponse.json({ message: "success", images })
}

async function getScreenshot(url: string, width: string, height: string, fullPage: string) {


    const response = await fetch(`https://api.screenshotone.com/take?access_key=yR6GX0-0Upbdlg&url=${url}&full_page=${fullPage}`)

    const buffer = await response.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString('base64');

    return base64Data
}