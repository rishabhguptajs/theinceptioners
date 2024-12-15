'use client';

import { useState } from 'react';
import axios from 'axios';

interface AddPackageModalProps {
    onClose: () => void;
    onSuccess: () => void;
    showToast: (message: string, type: 'success' | 'error') => void;
}

export default function AddPackageModal({ onClose, onSuccess, showToast }: AddPackageModalProps) {
    const [packageForm, setPackageForm] = useState({
        title: '',
        description: '',
        price: '',
        availableDates: [''],
        image: null as File | null
    });

    const handleDateChange = (index: number, value: string) => {
        const newDates = [...packageForm.availableDates];
        newDates[index] = value;
        setPackageForm({ ...packageForm, availableDates: newDates });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const authString = localStorage.getItem('adminAuth');
        
        try {
            const packageData = {
                title: packageForm.title,
                description: packageForm.description,
                price: parseFloat(packageForm.price),
                availableDates: packageForm.availableDates
            };

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/packages/admin/packages`,
                packageData,
                { headers: { 'Authorization': `Basic ${authString}` } }
            );

            if (packageForm.image && response.data.newPackage._id) {
                const formData = new FormData();
                formData.append('image', packageForm.image);
                await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/packages/admin/packages/${response.data.newPackage._id}/image`,
                    formData,
                    { headers: { 'Authorization': `Basic ${authString}` } }
                );
            }

            showToast('Package created successfully', 'success');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error creating package:', error);
            showToast('Error creating package', 'error');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg">
                <h3 className="text-2xl font-bold mb-4 text-gray-900 text-center">
                    Add New Package
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-900">Title</label>
                        <input
                            type="text"
                            required
                            placeholder="Enter package title"
                            value={packageForm.title}
                            onChange={(e) => setPackageForm({ ...packageForm, title: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 bg-gray-100 text-gray-900 placeholder-gray-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900">Description</label>
                        <textarea
                            required
                            placeholder="Provide a brief description of the package"
                            value={packageForm.description}
                            onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 bg-gray-100 text-gray-900 placeholder-gray-500"
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900">Price</label>
                        <input
                            type="number"
                            required
                            placeholder="Enter package price"
                            value={packageForm.price}
                            onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 bg-gray-100 text-gray-900 placeholder-gray-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900">Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            required
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setPackageForm({ ...packageForm, image: file });
                                }
                            }}
                            className="mt-1 block w-full bg-gray-100 text-gray-900 placeholder-gray-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Available Dates
                        </label>
                        <div className="space-y-2">
                            {packageForm.availableDates.map((date, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="date"
                                        required
                                        value={date.split('T')[0]}
                                        onChange={(e) => handleDateChange(index, e.target.value)}
                                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 bg-gray-100 text-gray-900"
                                    />
                                    {packageForm.availableDates.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newDates = packageForm.availableDates.filter((_, i) => i !== index);
                                                setPackageForm({ ...packageForm, availableDates: newDates });
                                            }}
                                            className="px-2 py-1 text-red-600 hover:bg-red-100 rounded-md"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => {
                                    setPackageForm({
                                        ...packageForm,
                                        availableDates: [...packageForm.availableDates, '']
                                    });
                                }}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                                + Add Another Date
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 border border-gray-300 rounded-md"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                        >
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 