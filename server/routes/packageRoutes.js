import express from 'express';
import multer from 'multer';
import {
    getAllPackages,
    getPackageById,
    createPackage,
    updatePackage,
    deletePackage,
    handlePackageImageUpload,
    getPackageImage,
    searchPackages,
    getPaginatedPackages
} from '../controllers/packageController.js';
import { basicAuth } from '../middleware/auth.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/search', searchPackages);
router.get('/paginated', getPaginatedPackages);
router.get('/:id/image', getPackageImage);
router.get('/:id', getPackageById);
router.get('/', getAllPackages);

router.post('/admin/packages', basicAuth, createPackage);
router.put('/admin/packages/:id', basicAuth, updatePackage); 
router.delete('/admin/packages/:id', basicAuth, deletePackage);
router.post('/admin/packages/:id/image', upload.single('image'), handlePackageImageUpload);

export default router;