import Image from 'next/image'
import Link from 'next/link'

export default function NotFound() {
    return (
        <main className="mx-auto max-w-9/10 xl:max-w-lg-custom py-10 font-primary">
            <div className="relative w-50 xl:w-75 h-50 xl:h-75 mx-auto">
                <Image
                    src="/error-illustration-water.png"
                    alt="404 error"
                    fill
                    loading="eager"
                    style={{ objectFit: 'cover' }}
                />
            </div>
            <p className="text-md text-center mt-0 mb-10">We&apos;re sorry, the page you were looking for could not be found. <Link href="/" className="inline underline hover:text-gray-600">We have plenty of great recipes on our homepage</Link>, or try again later.</p>
            <div className="flex justify-center">
                <Link href="/" className="inline-block p-4 bg-sky-600 text-white font-semibold rounded-lg hover:brightness-125 focus:brightness-125 cursor-pointer">
                    Back to all recipes
                </Link>
            </div>
        </main>
    )
}