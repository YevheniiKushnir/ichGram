import { Router } from 'express';
import { getSignature } from '../controllers/uploadController';

const router = Router();

router.get('/signature', getSignature);

export default router;