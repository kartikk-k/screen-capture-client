"use client"

import { Checkbox } from '@/components/ui/checkbox'
import JSZip from 'jszip'
import Image from 'next/image'
import React from 'react'
import { Loader2Icon } from 'lucide-react'
import z from 'zod'

function Page() {

    const [urls, setUrls] = React.useState<string>('')

    // const [darkMode, setDarkMode] = React.useState(false)
    const [fullScreen, setFullScreen] = React.useState(true)
    const [width, setWidth] = React.useState(1440)
    // const [height, setHeight] = React.useState(1080)

    const [inProgress, setInProgress] = React.useState(false)
    const [results, setResults] = React.useState<{url: string, image:string}[]>([])

    const renderWebPage = async () => {
        if (!urls) return

        setInProgress(true)
        setResults([])

        const validUrls = validateUrls(urls)
        setUrls(validUrls.join(', '))


        const promises = validUrls.map(async (url) => {
            return await getScreenshot(url)
        })

        await Promise.allSettled(promises)

        setInProgress(false)

    }

    const getScreenshot = async (url: string) => {

        const apiEndpoint = new URL('https://api.screenshotone.com/take')

        apiEndpoint.searchParams.set('access_key', process.env.NEXT_PUBLIC_SCREENSHOTONE_API_KEY!)
        apiEndpoint.searchParams.set('url', url)

        fullScreen && apiEndpoint.searchParams.set('full_page', fullScreen.toString())
        fullScreen && apiEndpoint.searchParams.set('full_page_scroll', 'true')

        apiEndpoint.searchParams.set('viewport_width', width.toString())
        // apiEndpoint.searchParams.set('viewport_height', height.toString())

        await fetch(apiEndpoint.toString())
            .then(async response => {
                if(response.status !== 200) throw new Error('Failed to fetch')

                const buffer = await response.arrayBuffer();
                const base64Data = Buffer.from(buffer).toString('base64');

                setResults(prev => [...prev, {url: url, image:base64Data}])
            })
            .catch(err => {console.log("we" ,err) })

    }


    const validateUrls = (value: string) => {
        const urlSchema = z.string().url()

        if (!value) return []

        let validUrls: string[] = []

        value.split(/\s|\n/)
            .map(url => url.trim())
            .join(',')
            .split(',')
            .filter(url => {
                const isValid = urlSchema.safeParse(url);
                if (isValid.success) {
                    validUrls.push(url);
                    return true;
                }
                return false;
            });

        console.log(validUrls)
        return validUrls
    }

    const downloadZip = () => {
        if (!results) return
        const zip = new JSZip();
        // @ts-ignore
        results.forEach((item) => {
            zip.file(`${item.url}.png`, item.image, { base64: true });
        });

        zip.generateAsync({ type: "blob" })
            .then(function (content) {
                // see FileSaver.js
                const url = window.URL.createObjectURL(content);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'results.zip';
                a.click();
            });
    }

    return (
        <div className='space-y-24 w-full flex flex-col items-center'>
            <div className='flex flex-col items-center space-y-12'>
                <h1 className='text-[#5e8e5f] text-6xl font-medium text-center'>
                    Screen Capture from URLs for Developer and Designers
                </h1>
                <p className='text-[#d6ecd8] text-sm max-w-2xl text-center leading-8 tracking-wider font-light'>
                    We developed this as an internal tool because Webflow&apos;s WebP converter compresses images excessively, resulting in quality degradation. Now, it&apos;s available for free to everyone.
                </p>
            </div>

            <div className='w-full space-y-8 bg-[#202427] p-10 rounded-xl border border-[#404b48]'>
                <div className='flex items-center gap-6'>
                    <input type="text"
                        value={urls}
                        onChange={(e) => setUrls(e.target.value)}
                        className='bg-[#2b2f32] h-12 w-full rounded-lg outline-none px-4 text-white'
                        placeholder='add multiple URLs separated by comma'
                    />
                    <button
                        onClick={renderWebPage}
                        disabled={inProgress || !urls.trim()}
                        className='bg-[#285446] flex items-center justify-center disabled:opacity-50 text-white h-12 min-w-[150px] rounded-lg'
                    >
                        {!inProgress ? (
                            'Render'
                        ) : (
                            <Loader2Icon className='animate-spin' size={20} />
                        )}
                        {/* Render */}
                    </button>
                </div>

                <div className='flex items-center justify-between'>
                    <div className='flex items-center justify-center text-[#d6ecd8] text-sm gap-8'>
                        {/* <div className='flex items-center gap-2'>
                            <Checkbox
                                checked={darkMode}
                                onCheckedChange={() => setDarkMode(!darkMode)}
                            />
                            <label>Dark mode</label>
                        </div> */}

                        <div className='flex items-center gap-2'>
                            <Checkbox
                                checked={fullScreen}
                                onCheckedChange={() => setFullScreen(!fullScreen)}
                            />
                            <label>Full screen</label>
                        </div>

                        <div className='flex items-center gap-2'>
                            <input
                                type="number"
                                value={width}
                                onChange={(e) => setWidth(Number(e.target.value))}
                                className='bg-[#2b2f32] rounded-md h-6 w-16 px-1 text-center outline-none'
                            />
                            <label>Width</label>
                        </div>

                        {/* <div className='flex items-center gap-2'>
                            <input
                                type="number"
                                value={height}
                                onChange={(e) => setHeight(Number(e.target.value))}
                                className='bg-[#2b2f32] rounded-md h-6 w-16 px-1 text-center outline-none'
                            />
                            <label>Height</label>
                        </div> */}
                    </div>
                    <button
                        onClick={downloadZip}
                        disabled={(results.length < 1) || inProgress}
                        className='border-2 border-[#285446] disabled:opacity-50 text-white h-12 min-w-[150px] rounded-lg'
                    >
                        Download zip
                    </button>
                </div>


                {results?.length > 0 && (

                    <div className='flex flex-col gap-12'>
                        <hr className='border-[#2b2f32]' />

                        <div className='columns-3 space-y-4'>
                            {results && results.map((item) => (
                                <Image
                                    key={item.url}
                                    src={`data:image/png;base64,${item.image}`}
                                    width={400}
                                    height={720}
                                    alt='result'
                                    className='w-full h-auto rounded-md'
                                />
                            ))}
                        </div>
                    </div>

                )}

            </div>

        </div>
    )
}

export default Page