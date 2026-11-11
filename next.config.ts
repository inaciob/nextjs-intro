// NOTE: This config file is necessary for allowing remote images

import type { NextConfig } from 'next'

const config: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.dummyjson.com',
                port: '',
                pathname: '/**',
            },
        ],
        qualities: [75, 85, 90],
        formats: ['image/avif', 'image/webp'],
    },
}

export default config