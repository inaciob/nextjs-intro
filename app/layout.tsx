import './globals.css'
import Link from 'next/link'
import Image from 'next/image'

export default function RootLayout({ children,}: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="bg-main-bg">
                <nav className="flex justify-center bg-white shadow-sm">
                    {/*
                        NOTE: Width and height are required properties for the Next.js Image component unless either
                                the image is statically imported OR the image has the fill property
                    */}
                    <Link href="/">
                        <Image src="/logo.png" alt="Squeasy logo" width={140} height={140} loading="eager" />
                    </Link>
                </nav>
                {children}
            </body>
        </html>
    )
}