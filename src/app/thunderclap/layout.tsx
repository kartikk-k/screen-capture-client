import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import Logo from '../../assets/logo.svg'

function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className='bg-[#101518] min-h-screen h-auto pb-48'>
            {/* navbar */}
            <div className='flex items-center justify-between py-6 px-16'>
                <Link href='/'>
                    <Image
                        src={Logo}
                        alt='tunderclap'
                        className='text-white'
                    />
                </Link>

                <div className='text-[#81a07f] flex gap-8'>
                    <p>Work</p>
                    <p>About Us</p>
                    <p>Services</p>
                    <p>Contact Us</p>
                </div>

                <button
                    className='bg-[#285446] text-white h-12 px-12 rounded-sm'
                >
                    Start A Project
                </button>
            </div>

            <main className='flex flex-col items-center justify-center my-20 max-w-5xl mx-auto p-10 md:p-0'>
                {children}
            </main>

        </div>
    )
}

export default Layout