'use client'

export default function PrintButton() {
    const handlePrint = () => {
        window.print()
    }

    return (
        <button onClick={handlePrint}
                className="print:hidden inline-block xl:mr-[1.125rem] mb-6 text-base underline hover:text-gray-600 cursor-pointer"
        >
            Print this recipe
        </button>
    )
}