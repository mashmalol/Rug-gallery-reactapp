import { Router } from 'express';
import { supabase } from '../supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/me', requireAuth, (req, res) => {
  const { id, email, created_at, user_metadata } = req.user;
  res.json({
    id,
    email,
    createdAt: created_at,
    fullName: user_metadata?.full_name || null,
  });
});

export default router;
