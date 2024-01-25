import {Router} from 'express'
import multer from 'multer'
import {registerUser, loginUser, logout, getAllUser} from '../controllers/controller';
// import { getuserdata } from '../controllers/getUserData';
import {checkAuth, ownership} from '../middleware/Auth';
// import { logout } from '../controllers/logout';


const router = Router()

router.post('/registerUser',registerUser);
router.route('/loginUser').post(loginUser);
// router.get('/getuserdata/:id',checkAuth, ownership, getuserdata);
router.get('/logout', logout);
// router.put('/user/:id',checkAuth, ownership, updateUser);
// router.delete('/user/:id',checkAuth, ownership, deleteUser);
router.get('/getAllUsers',getAllUser )

export default router;