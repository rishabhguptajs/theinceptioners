export interface Package {
    _id: string;
    title: string;
    description: string;
    price: number;
    availableDates: string[];
}

export interface Booking {
    _id: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    numberOfTravelers: number;
    package: Package;
    totalPrice: number;
    createdAt: string;
} 