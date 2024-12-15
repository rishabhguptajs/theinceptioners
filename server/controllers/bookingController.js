import Booking from "../models/Booking.js";
import Package from "../models/Package.js";

export const createBooking = async(req, res) => {
    try {
        const { 
            customerName,
            customerEmail,
            customerPhone,
            numberOfTravelers,
            packageId,
            totalPrice,
            specialRequests
        } = req.body;

        if (!customerName || !customerEmail || !customerPhone || !numberOfTravelers || !packageId || !totalPrice) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }

        if (numberOfTravelers < 1) {
            return res.status(400).json({
                success: false,
                message: 'Number of travelers must be at least 1',
            });
        }

        const packageData = await Package.findById(packageId);
        if (!packageData) {
            return res.status(404).json({
                success: false,
                message: 'Package not found',
            });
        }

        const newBooking = await Booking.create({
            customerName,
            customerEmail,
            customerPhone,
            numberOfTravelers,
            package: packageId,
            totalPrice,
            specialRequests: specialRequests || []
        });

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking: newBooking
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating booking'
        });
    }
}

export const getBookings = async(req, res) => {
    try {
        const bookings = await Booking.find().populate('package', 'title description price');
        res.status(200).json({
            success: true,
            message: 'Bookings fetched successfully',
            bookings
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching bookings'
        });
    }
}