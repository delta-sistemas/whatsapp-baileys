import { Router } from 'express';
import { 
    newIntegration,
    deleteIntegration, 
} from '../controllers/integrationController';

const router = Router();

router.get('/new', newIntegration)
router.delete('/delete/:uuid', deleteIntegration)

export default router;