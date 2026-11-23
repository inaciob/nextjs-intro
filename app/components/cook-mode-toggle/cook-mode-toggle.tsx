'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export default function CookModeToggle() {
    const [enabled, setEnabled] = useState(false)
    const [active, setActive] = useState(false)
    const [supported, setSupported] = useState(true)
    const [error, setError] = useState(false)

    // NOTE: The reason for no custom Type or Interface definition on WakeLockSentinel is because this is using a browser API object
    const wakeLockRef = useRef<WakeLockSentinel | null>(null)
    const enabledRef = useRef(false)
    const requestIdRef = useRef(0)

    // Release the current wake lock if one already exists
    const releaseWakeLock = useCallback(async () => {
        const sentinel = wakeLockRef.current

        wakeLockRef.current = null
        setActive(false)

        if (sentinel && !sentinel.released) {
            try {
                await sentinel.release()
            }
            catch (err) {
                console.error('Unable to release wake lock: ', err)
            }
        }
    }, [])

    // Disable Cook Mode and invalidate any pending requests
    const disableCookMode = useCallback(async () => {
        requestIdRef.current++

        enabledRef.current = false

        setEnabled(false)
        setActive(false)
        setError(false)

        await releaseWakeLock()
    }, [releaseWakeLock])

    // Request a screen wake lock
    const requestWakeLock = useCallback(async () => {
        if (!('wakeLock' in navigator) || document.visibilityState !== 'visible' || !enabledRef.current) {
            return
        }

        const requestId = ++requestIdRef.current

        try {
            const sentinel = await navigator.wakeLock.request('screen')

            // Prevent a late request from activating Cook Mode after the user has already disabled it
            if (requestId !== requestIdRef.current || !enabledRef.current || document.visibilityState !== 'visible') {
                await sentinel.release()
                return
            }

            wakeLockRef.current = sentinel

            setActive(true)
            setError(false)

            sentinel.addEventListener('release', () => {
                if (wakeLockRef.current === sentinel) {
                    wakeLockRef.current = null

                    setActive(false)

                    // Unexpected browser release:
                    // switch Cook Mode to OFF as well
                    if (enabledRef.current) {
                        void disableCookMode()
                    }
                }
            })
        }
        catch (err) {
            console.error('Unable to activate Cook Mode: ', err)

            if (requestId === requestIdRef.current) {
                void disableCookMode()
                setError(true)
            }
        }
    }, [disableCookMode])

    const toggleCookMode = async () => {
        if (enabledRef.current) {
            await disableCookMode()
        }
        else {
            if (!('wakeLock' in navigator)) {
                setSupported(false)
                return
            }

            enabledRef.current = true
            setEnabled(true)
            setError(false)

            await requestWakeLock()
        }
    }

    useEffect(() => {
        if (!('wakeLock' in navigator)) {
            setSupported(false)
            return
        }

        const handleVisibilityChange = () => {
            // Leaving the browser tab or application automatically disables Cook Mode
            if (document.visibilityState === 'hidden') {
                if (enabledRef.current) {
                    void disableCookMode()
                }
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)

        // Cleanup
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)

            requestIdRef.current++
            enabledRef.current = false

            const sentinel = wakeLockRef.current
            wakeLockRef.current = null

            if (sentinel && !sentinel.released) {
                void sentinel.release().catch(() => {})
            }
        }
    }, [disableCookMode])

    if (!supported) {
        return (
            <p className="text-md text-gray-600" role="status">
                Cook Mode is not supported by this browser.
            </p>
        )
    }

    return (
        <div className="flex flex-row justify-between items-center gap-2 pt-6 xl:pb-6 print:hidden">
            <div>
                <span className="text-md font-medium">
                    Enable Cook Mode
                </span>

                <p
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    className="text-sm text-gray-600 text-left"
                >
                    {error
                        ? 'Unable to keep your screen awake. Please try again.'
                        : active
                            ? 'Cook Mode is active.'
                            : enabled
                                ? 'Cook Mode is on. Waiting to activate screen wake lock.'
                                : 'Keep screen awake while cooking'
                    }
                </p>
            </div>

            <div className='flex flex-col items-center'>
                <span>{enabled ? 'ON' : 'OFF'}</span>
                <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    aria-label="Cook Mode"
                    onClick={toggleCookMode}
                    className={`
                    relative inline-flex items-center
                    w-14 h-8 rounded-lg border
                    transition-colors 
                    duration-200
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-blue-500
                    focus-visible:ring-offset-2 
                    border-border--light 
                    ${ enabled ? 'bg-sky-600' : 'bg-gray-200' }
                    cursor-pointer
                `}
                >
                    <span
                        aria-hidden="true"
                        className={`absolute w-6 h-6 rounded-md bg-white shadow-sm transition-transform duration-200 
                            ${ enabled ? 'translate-x-7' : 'translate-x-0.5' }
                        `}
                    />
                </button>
            </div>
        </div>
    )
}