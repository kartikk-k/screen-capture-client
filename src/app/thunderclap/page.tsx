"use client"

import { Checkbox } from '@/components/ui/checkbox'
import JSZip from 'jszip'
import Image from 'next/image'
import React from 'react'

function Page() {

    const [urls, setUrls] = React.useState<string>('')

    const [darkMode, setDarkMode] = React.useState(false)
    const [fullScreen, setFullScreen] = React.useState(false)
    const [width, setWidth] = React.useState(1440)
    const [height, setHeight] = React.useState(1080)

    const [inProgress, setInProgress] = React.useState(false)
    const [results, setResults] = React.useState<string[]>([])

    const renderWebPage = async () => {
        if (!urls) return

        setInProgress(true)

        await fetch(`/api/ss?urls=${urls}&darkMode=${darkMode}&fullPage=${fullScreen}&width=${width}&height=${height}`)
            .then(response => response.json())
            .then(data => {
                if (!data.results) alert("Error")
                setResults(data.results)
            })
            .catch(error => alert('error' + error))

        setInProgress(false)

    }

    const downloadZip = () => {
        if (!results) return
        const zip = new JSZip();
        // @ts-ignore
        results.forEach((item, i) => {
            zip.file(`result-${i}.png`, item, { base64: true });
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
                        disabled={inProgress}
                        className='bg-[#285446] disabled:opacity-50 text-white h-12 min-w-[150px] rounded-lg'
                    >
                        Render
                    </button>
                </div>

                <div className='flex items-center justify-between'>
                    <div className='flex items-center justify-center text-[#d6ecd8] text-sm gap-12'>
                        <div className='flex items-center gap-2'>
                            <Checkbox
                                checked={darkMode}
                                onCheckedChange={() => setDarkMode(!darkMode)}
                            />
                            <label>Dark mode</label>
                        </div>

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

                        <div className='flex items-center gap-2'>
                            <input
                                type="number"
                                value={height}
                                onChange={(e) => setHeight(Number(e.target.value))}
                                className='bg-[#2b2f32] rounded-md h-6 w-16 px-1 text-center outline-none'
                            />
                            <label>Height</label>
                        </div>
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
                            {results && results.map((item, i) => (
                                <Image
                                    key={i}
                                    src={`data:image/png;base64,${item}`}
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