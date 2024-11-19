const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT post.*, users.name, users.profile_image
            FROM post
            INNER JOIN users ON post.user_id = users.id
            ORDER BY post.created_at DESC
        `);
        res.status(200).json({
            message: 'Posts retrieved successfully',
            posts: result.rows,
        });
    } catch (error) {
        res.status(400).json({
            message: `Error retrieving posts: ${error.message}`,
        });
    }
})


router.get('/:id', async (req, res) => {
    const postId = req.params.id;

    try {
        const result = await db.query('SELECT * FROM post WHERE id = $1', [postId]);
        const post = result.rows[0];

        if (!post) 
            return res.status(404).json({ message: 'Post not found' });
    
        res.status(200).json({ message: 'Post retrieved successfully', post });
    } catch (error) {
        res.status(400).json({ message: `Error retrieving post: ${error.message}` });
    }
});

router.post('/', async (req, res) => {
    const { title, content, location, user_id } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO post (title, content, location, user_id) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [title, content, location, user_id]
        );
        res.status(201).json({ message: 'Post created successfully', post: result.rows[0] });
    } catch (error) {
        res.status(400).json({ message: `Error creating post: ${error.message}` });
    }
});



router.delete('/:id', async (req, res) => {
    const postId = req.params.id;
    try {
        const result = await db.query('SELECT * FROM post WHERE id = $1', [postId]);
        const post = result.rows[0];

        if (!post) 
            return res.status(404).json({ message: 'Post not found' });        

        await db.query('DELETE FROM post WHERE id = $1', [postId]);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: `Error deleting post: ${error.message}` });
    }
});


router.put('/:id', async (req, res) => {
    const postId = req.params.id;
    const { title, content, location } = req.body;

    try {
     
        const result = await db.query('SELECT * FROM post WHERE id = $1', [postId]);
        const post = result.rows[0];

        if (!post) 
            return res.status(404).json({ message: 'Post not found' });

        const updateFields = [];
        const values = [];

        if (title) updateFields.push(`title = $${values.push(title)}`);
        if (content) updateFields.push(`content = $${values.push(content)}`);
        if (location) updateFields.push(`location = $${values.push(location)}`);

        if (updateFields.length === 0) 
         return res.status(400).json({ message: 'No fields to update' });
        
        values.push(postId);

        const updateQuery = `UPDATE post SET ${updateFields.join(', ')} WHERE id = $${values.length} RETURNING *`;
        const updateResult = await db.query(updateQuery, values);

        res.status(200).json({ message: 'Post updated successfully', post: updateResult.rows[0] });
    } catch (error) {
        res.status(400).json({ message: `Error updating post: ${error.message}` });
    }
});

module.exports = router;
