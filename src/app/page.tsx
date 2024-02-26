"use client";

import Image from 'next/image';
import React, { useEffect } from 'react'

function Home() {

  const [inProgress, setInProgress] = React.useState(false)
  const [url, setUrl] = React.useState('')
  const [result, setResult] = React.useState('')

  // const [useSitemap, setUseSitemap] = React.useState(false)

  const imgRef = React.useRef(null)

  const renderWebPage = async () => {
    if (!url) return

    setInProgress(true)

    await fetch(`http://localhost:8080/api/screenshot?url=${url}?timeout=15000`)
      .then(response => response.json())
      .then(data => {
        if (!data.result) alert("Error")
        setResult(data.result)
      })
      .catch(error => alert('error' + error))

    setInProgress(false)

  }


  useEffect(() => {
    if (!result) return
    if (imgRef.current) {
      // @ts-ignore
      imgRef.current.src = `data:image/png;base64,${result}`
    }
  }, [result])

  return (
    <div className='bg-[#191E2A] flex-col space-y-24 min-h-screen text-[#556986] flex items-center'>

      <div className='pt-32 space-y-4 flex items-center flex-col'>
        <div className='space-x-4 '>
          <input
            type="text"
            onChange={e => setUrl(e.target.value)}
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

        {/* <div className='flex items-center gap-2'>
          <button
            role='checkbox'
            onClick={() => setUseSitemap(!useSitemap)}
            className={`${useSitemap ? 'bg-[#6F71FF] outline-white' : 'bg-black/20 outline-[#556986] '}  outline outline-2 h-6 w-6 rounded-full`}
          >

          </button>

          <p>Use Sitemap</p>
        </div> */}

      </div>

      {
        result && (
          <Image
            ref={imgRef}
            src={''}
            width={800}
            height={600}
            alt='result'
            className='w-[80vw] h-auto rounded-xl'
          />
        )
      }

    </div >
  )
}

export default Home