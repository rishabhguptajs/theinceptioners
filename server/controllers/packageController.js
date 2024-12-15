import Package from "../models/Package.js";

export const getAllPackages = async (req, res) => {
    try {
        const packages = await Package.find().select('-image')
        res.status(200).json({
            success: true,
            message: 'Packages fetched successfully',
            packages,
        });
    } catch (error) {
        console.log('Error fetching packages:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
}

export const getPackageById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Package ID is required',
            });
        }
        const specificPackage = await Package.findById(id);
        if (!specificPackage) {
            return res.status(404).json({
                success: false,
                message: 'Package not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Package fetched successfully',
            specificPackage,
        });
    } catch (error) {
        console.log('Error fetching package by id:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
}

export const createPackage = async (req, res) => {
    try {
        const { title, description, price, availableDates } = req.body;

        if (!title || !description || !price || !availableDates) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }
        
        const newPackage = await Package.create({ title, description, price, availableDates });

        res.status(201).json({
            success: true,
            message: 'Package created successfully',
            newPackage,
        });
    } catch (error) {
        console.log('Error creating package:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
}

export const handlePackageImageUpload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        const { id } = req.params;

        const packageData = await Package.findById(id);
        if (!packageData) {
            return res.status(404).json({
                success: false,
                message: 'Package not found'
            });
        }

        packageData.image = {
            data: req.file.buffer,
            contentType: req.file.mimetype
        };

        await packageData.save();

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            package: {
                ...packageData._doc,
                image: undefined
            }
        });

    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading image'
        });
    }
}

export const getPackageImage = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid package ID format'
            });
        }

        const packageData = await Package.findById(id);

        if (!packageData) {
            return res.status(404).json({
                success: false,
                message: 'Package not found'
            });
        }

        if (!packageData.image || !packageData.image.data) {
            return res.status(404).json({
                success: false,
                message: 'No image found for this package'
            });
        }

        res.set('Cache-Control', 'public, max-age=3600');
        res.contentType(packageData.image.contentType);
        res.send(packageData.image.data);
    } catch (error) {
        console.error('Error retrieving image:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving image'
        });
    }
}

export const updatePackage = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, price, availableDates } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Package ID is required'
            });
        }

        const updatedPackage = await Package.findByIdAndUpdate(
            id,
            { title, description, price, availableDates },
            { new: true, runValidators: true }
        );

        if (!updatedPackage) {
            return res.status(404).json({
                success: false,
                message: 'Package not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Package updated successfully',
            package: updatedPackage
        });

    } catch (error) {
        console.error('Error updating package:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating package'
        });
    }
};

export const deletePackage = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Package ID is required'
            });
        }

        const deletedPackage = await Package.findByIdAndDelete(id);

        if (!deletedPackage) {
            return res.status(404).json({
                success: false,
                message: 'Package not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Package deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting package:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting package'
        });
    }
};

export const searchPackages = async (req, res) => {
    try {
        const { minPrice, maxPrice, search } = req.query;
        const query = {};

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) {
                const min = Number(minPrice);
                if (isNaN(min) || min < 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid minimum price'
                    });
                }
                query.price.$gte = min;
            }
            if (maxPrice) {
                const max = Number(maxPrice);
                if (isNaN(max) || max < 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid maximum price'
                    });
                }
                if (minPrice && max < Number(minPrice)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Maximum price cannot be less than minimum price'
                    });
                }
                query.price.$lte = max;
            }
        }

        if (search) {
            const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            query.$or = [
                { title: { $regex: sanitizedSearch, $options: 'i' } },
                { description: { $regex: sanitizedSearch, $options: 'i' } }
            ];
        }

        const packages = await Package.find(query)
            .select('-image')
            .lean()
            .limit(50);

        res.status(200).json({
            success: true,
            message: 'Packages fetched successfully',
            packages,
            count: packages.length
        });

    } catch (error) {
        console.error('Error searching packages:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching packages',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const getPaginatedPackages = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [packages, totalPackages] = await Promise.all([
            Package.find()
                .select('-image')
                .skip(skip)
                .limit(limit)
                .lean(),
            Package.countDocuments()
        ]);

        res.status(200).json({
            success: true,
            message: 'Packages fetched successfully',
            packages,
            currentPage: page,
            totalPages: Math.ceil(totalPackages / limit),
            totalPackages
        });

    } catch (error) {
        console.error('Error fetching paginated packages:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching packages'
        });
    }
};