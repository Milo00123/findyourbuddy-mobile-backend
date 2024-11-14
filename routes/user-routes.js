const express = require('express');
const router = require('express').Router();
const db = require('../db')
const multer = require('multer');
const bcrypt = require('bcryptjs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });



router.get('/', async (req, res) =>{
    try{
        const  result = await db.query('SELECT * FROM users');
        res.status(200).json(result.rows);
    } catch (error){
        res.status(400).send(`Error getting users: ${error.message}`);
    }
});
router.get('/:id', async(req, res) => {
    try{
        const result = await db.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
        const user = result.rows[0];
        if (!user)
            return res.status(404).send('user not found');
        res.status(200).json(user);
    } catch (error){
        res.status(400).send(`Error getting user: ${error.message}`);
    }
  
})

router.delete('/:id', async (req, res) => {
    const sessionUserId = req.session.userId; 
    const sessionUserEmail = req.session.userEmail;
    const sessionProviderId = req.session.providerId;
    try {
        const result = await db.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
        const user = result.rows[0];       
        if (!user) 
            return res.status(404).send('User not found');

        const isAuthorized =
        (sessionUserId && user.id === sessionUserId) ||
        (sessionUserEmail && user.email === sessionUserEmail) ||
        (sessionProviderId && user.provider_id === sessionProviderId);

        if (!isAuthorized)
            return res.status(403).send('You are not authorized to delete this profile');
        
        await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        res.status(200).send('User deleted');
    } catch (err) {
        res.status(400).send(`Error deleting user: ${err.message}`);
    }
});


router.put('/:id', upload.single('profile_image'), async (req, res) => {
    const { name, about, riding_level } = req.body;
    const profileImage = req.file ? `/uploads/${req.file.filename}` : null;
    
    const sessionUserId = req.session.userId; 
    const sessionUserEmail = req.session.userEmail;
    const sessionProviderId = req.session.providerId; 

    try {

        const result = await db.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
        const user = result.rows[0];

        if (!user) 
            return res.status(404).json({ message: 'User not found' });

        const isAuthorized =
            (sessionUserId && user.id === sessionUserId) ||
            (sessionUserEmail && user.email === sessionUserEmail) ||
            (sessionProviderId && user.provider_id === sessionProviderId);

        if (!isAuthorized) 
            return res.status(403).json({ message: 'Unauthorized' });
        
        const updateFields = [];
        const values = [];
        
        if (name) updateFields.push(`name = $${values.push(name)}`);
        if (about) updateFields.push(`about = $${values.push(about)}`);
        if (riding_level) updateFields.push(`riding_level = $${values.push(riding_level)}`);
        if (profileImage) updateFields.push(`profile_image = $${values.push(profileImage)}`);

        values.push(req.params.id);
        
        const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${values.length} RETURNING *`;
        const updateResult = await db.query(updateQuery, values);

        res.status(200).json({ message: 'User updated successfully', user: updateResult.rows[0] });
    } catch (err) {
        res.status(400).json({ message: `Error updating user: ${err.message}` });
    }
});

module.exports = router;