'use client'

import Image from 'next/image'

import { useEffect } from 'react'

export default function Error({ error, retry, }: { error: unknown, retry: () => void }) {
    useEffect(() => {
        console.error('There was an error rendering the page: ', error)
    }, [error])

    return (
        <main className="mx-auto max-w-9/10 xl:max-w-lg-custom py-10 font-primary">
            <div className="relative w-50 xl:w-75 h-50 xl:h-75 mx-auto">
                <Image
                    src="/error-illustration-coffee.png"
                    alt="Server error"
                    fill
                    loading="eager"
                    style={{ objectFit: 'cover' }}
                />
            </div>
            <p className="text-md text-center mt-0 mb-10">Oh dear, something seems to have spilled here. Please refresh your page or try again later.</p>
            <div className="flex justify-center">
                <button type="button"
                        className="inline-block p-4 bg-sky-600 text-white font-semibold rounded-lg hover:brightness-125 focus:brightness-125 cursor-pointer"
                        onClick={
                            // Attempt to recover by re-fetching and re-rendering the segment
                            () => retry()
                        }>
                    Try again
                </button>
            </div>
        </main>
    )
}