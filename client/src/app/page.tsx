'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'

interface Package {
  _id: string
  title: string
  description: string
  price: number
}

interface ImageMap {
  [key: string]: string | null
}

interface SearchFilters {
    search: string;
    minPrice: string;
    maxPrice: string;
}

const Home = () => {
    const [packages, setPackages] = useState<Package[]>([])
    const [packageImages, setPackageImages] = useState<ImageMap>({})
    const [filters, setFilters] = useState<SearchFilters>({
        search: '',
        minPrice: '',
        maxPrice: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPackages = async (params?: URLSearchParams) => {
        try {
            setLoading(true);
            setError(null);
            
            const url = params 
                ? `${process.env.NEXT_PUBLIC_API_URL}/packages/search?${params}`
                : `${process.env.NEXT_PUBLIC_API_URL}/packages`;
            
            const response = await axios.get(url);
            
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch packages');
            }

            if (!response.data.packages || !Array.isArray(response.data.packages)) {
                throw new Error('Invalid package data received');
            }

            setPackages(response.data.packages);
            
            const fetchImageWithRetry = async (pkg: Package, retries = 2) => {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 5000);

                    const imageResponse = await axios.get(
                        `${process.env.NEXT_PUBLIC_API_URL}/packages/${pkg._id}/image`,
                        { 
                            responseType: 'blob',
                            signal: controller.signal 
                        }
                    );

                    clearTimeout(timeoutId);
                    const imageUrl = URL.createObjectURL(imageResponse.data);
                    return { id: pkg._id, url: imageUrl };
                } catch (error: any) {
                    if (retries > 0 && error.name !== 'AbortError') {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        return fetchImageWithRetry(pkg, retries - 1);
                    }
                    console.error(`Error fetching image for package ${pkg._id}:`, error);
                    return { id: pkg._id, url: null };
                }
            };

            const imagePromises = response.data.packages.map((pkg: Package) => fetchImageWithRetry(pkg));
            const images = await Promise.all(imagePromises);
            const imageMap = images.reduce((acc, img) => ({
                ...acc,
                [img.id]: img.url
            }), {});
            
            setPackageImages(imageMap);
        } catch (error: any) {
            console.error('Error fetching packages:', error);
            setError(error.message || 'Failed to load packages. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();

        return () => {
            Object.values(packageImages).forEach((url) => {
                if (url) URL.revokeObjectURL(url);
            });
        };
    }, []);

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        fetchPackages(params);
    };

    const searchSection = (
        <div className="mb-8">
            <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Search packages..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full px-3 py-2 border rounded-md"
                        />
                    </div>
                    <div>
                        <input
                            type="number"
                            placeholder="Min price"
                            value={filters.minPrice}
                            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                            className="w-full px-3 py-2 border rounded-md"
                        />
                    </div>
                    <div>
                        <input
                            type="number"
                            placeholder="Max price"
                            value={filters.maxPrice}
                            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                            className="w-full px-3 py-2 border rounded-md"
                        />
                    </div>
                    <div>
                        <button
                            onClick={handleSearch}
                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const ErrorDisplay = () => error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-8">
            <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
            </div>
        </div>
    ) : null;

    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 text-center mb-12">
                    Travel Agency
                </h1>

                {searchSection}
                <ErrorDisplay />

                {loading ? (
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                ) : packages.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <div className="text-gray-500">
                            <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <h3 className="text-xl font-medium text-gray-900 mb-2">No Packages Found</h3>
                            <p className="text-gray-600">Try adjusting your search criteria or check back later.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {packages.map((packageData: Package) => (
                            <div 
                                key={packageData._id} 
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                            >
                                <div className="relative h-64">
                                    <img 
                                        src={packageImages[packageData._id] || undefined} 
                                        alt={packageData.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
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
                )}
            </div>
        </main>
    )
}

export default Home