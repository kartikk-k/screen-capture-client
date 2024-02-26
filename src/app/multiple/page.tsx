"use client";

import Image from 'next/image';
import React, { useEffect } from 'react'
import JSZip from 'jszip';

function Home() {

    const [inProgress, setInProgress] = React.useState(false)
    const [urls, setUrls] = React.useState('')
    const [results, setResults] = React.useState<string[]>([])

    // const [useSitemap, setUseSitemap] = React.useState(false)

    const imgRef = React.useRef(null)

    const renderWebPage = async () => {
        if (!urls) return

        setInProgress(true)

        await fetch(`http://localhost:8080/api/screenshot/multiple?urls=${urls}&darkMode=true`)
            .then(response => response.json())
            .then(data => {
                if (!data.results) alert("Error")
                setResults(data.results)

                // converting array of base64 strings to zip file
                const zip = new JSZip();
                // @ts-ignore
                data.results.forEach((item, i) => {
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

            })
            .catch(error => alert('error' + error))

        setInProgress(false)

    }


    // useEffect(() => {
    //     if (!results) return
    //     if (imgRef.current) {
    //         // @ts-ignore
    //         imgRef.current.src = `data:image/png;base64,${result}`
    //     }
    // }, [results])

    return (
        <div className='bg-[#191E2A] flex-col space-y-24 min-h-screen text-[#556986] flex items-center'>

            <div className='pt-32 space-y-4 flex items-center flex-col'>
                <div className='space-x-4 '>
                    <input
                        type="text"
                        onChange={e => setUrls(e.target.value)}
                        className='bg-black/20 w-80 h-12 focus:outline-[#556986] outline-none text-white rounded-full text-center px-4'
                    />

                    <button
                        onClick={renderWebPage}
                        disabled={inProgress}
                        className='bg-[#6F71FF] px-8 rounded-full text-white h-12'
                    >
                        Render
                    </button>

                </div>

            </div>

            <div className='grid grid-cols-3 gap-12 p-4'>
                {results && results.map((item, i) => (
                    <Image
                        key={i}
                        src={`data:image/png;base64,${item}`}
                        width={800}
                        height={720}
                        alt='result'
                        className='w-auto h-auto rounded-xl'
                    />
                ))}
            </div>

        </div >
    )
}

export default Home