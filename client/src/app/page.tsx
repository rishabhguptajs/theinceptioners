'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Package {
  _id: string
  title: string
  description: string
  price: number
}

interface ImageMap {
  [key: string]: string | null
}

const Home = () => {
    const router = useRouter()
    const [packages, setPackages] = useState<Package[]>([])
    const [packageImages, setPackageImages] = useState<ImageMap>({})

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/packages`)
                setPackages(response.data.packages)
                
                const imagePromises = response.data.packages.map(async (pkg: Package) => {
                    try {
                        const imageResponse = await axios.get(
                            `${process.env.NEXT_PUBLIC_API_URL}/packages/${pkg._id}/image`,
                            { responseType: 'blob' }
                        )
                        const imageUrl = URL.createObjectURL(imageResponse.data)
                        return { id: pkg._id, url: imageUrl }
                    } catch (error) {
                        console.error(`Error fetching image for package ${pkg._id}:`, error)
                        return { id: pkg._id, url: null }
                    }
                })

                const images = await Promise.all(imagePromises)
                const imageMap = images.reduce((acc, img) => ({
                    ...acc,
                    [img.id]: img.url
                }), {})
                
                setPackageImages(imageMap)
            } catch (error) {
                console.error('Error fetching packages:', error)
            }
        }

        fetchPackages()

        return () => {
            Object.values(packageImages).forEach((url) => {
                if (url) URL.revokeObjectURL(url)
            })
        }
    }, [])

    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 text-center mb-12">
                    Travel Agency
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {packages.map((packageData: Package) => (
                        <div 
                            key={packageData._id} 
                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                        >
                            <img 
                                src={packageImages[packageData._id] || undefined} 
                                alt={packageData.title}
                                className="w-full h-64 object-cover"
                            />
                            <div className="p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                    {packageData.title}
                                </h2>
                                <p className="text-gray-600">
                                    {packageData.description}
                                </p>
                                <p className="text-lg font-bold text-indigo-600 mt-4">
                                    ₹{packageData.price}
                                </p>
                                <Link 
                                    href={`/booking/${packageData._id}`}
                                    className="block w-full mt-4 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-200 text-center"
                                >
                                    Book Now
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    )
}

export default Home
