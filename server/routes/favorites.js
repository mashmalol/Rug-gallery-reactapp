import { Router } from 'express';
import { supabase } from '../supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

router.post('/', requireAuth, async (req, res) => {
  const { title, image, price } = req.body;
  if (!title || !image) {
    return res.status(400).json({ error: 'title and image are required' });
  }

  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', req.user.id)
    .eq('title', title)
    .maybeSingle();

  if (existing) {
    return res.json({ message: 'Already favorited', id: existing.id });
  }

  const { data, error } = await supabase
    .from('favorites')
    .insert({ user_id: req.user.id, title, image, price: price || null })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

router.delete('/:title', requireAuth, async (req, res) => {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', req.user.id)
    .eq('title', req.params.title);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Removed' });
});

export default router;
