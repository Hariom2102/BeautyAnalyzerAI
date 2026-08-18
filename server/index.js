import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  saveAnalysis,
  getAllAnalyses,
  getAnalysisById,
  deleteAnalysis,
  clearAllAnalyses,
  getAnalyticsStats,
  getSettings,
  saveSettings
} from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure uploads directory exists
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static uploaded images
app.use('/uploads', express.static(uploadsDir));

// Serve static Vite build output in production
const distDir = path.join(__dirname, '../dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}

/* ==========================================================================
   API Routes
   ========================================================================== */

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString(), database: 'SQLite3' });
});

// Analytics & Stats
app.get('/api/analytics', async (req, res) => {
  try {
    const stats = await getAnalyticsStats();
    res.json(stats);
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get all history items
app.get('/api/history', async (req, res) => {
  try {
    const history = await getAllAnalyses();
    res.json(history);
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ error: 'Failed to fetch analysis history' });
  }
});

// Get single history item
app.get('/api/history/:id', async (req, res) => {
  try {
    const item = await getAnalysisById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Analysis item not found' });
    }
    res.json(item);
  } catch (err) {
    console.error('Error fetching analysis by ID:', err);
    res.status(500).json({ error: 'Failed to fetch analysis details' });
  }
});

// Save analysis item (converts base64 image to static file if provided)
app.post('/api/history', async (req, res) => {
  try {
    const analysisData = req.body;
    let imageUrl = analysisData.image || '';

    // If image is a base64 Data URL, write it to server uploads folder
    if (imageUrl.startsWith('data:image/')) {
      const id = analysisData.id || ('analysis_' + Date.now());
      const matches = imageUrl.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
      
      if (matches && matches.length === 3) {
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const base64Data = matches[2];
        const fileName = `${id}.${ext}`;
        const filePath = path.join(uploadsDir, fileName);

        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        imageUrl = `/uploads/${fileName}`;
      }
    }

    const saved = await saveAnalysis({
      ...analysisData,
      image: imageUrl
    });

    res.status(201).json(saved);
  } catch (err) {
    console.error('Error saving analysis:', err);
    res.status(500).json({ error: 'Failed to save analysis to database' });
  }
});

// Delete single history item
app.delete('/api/history/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await getAnalysisById(id);

    if (existing && existing.image && existing.image.startsWith('/uploads/')) {
      const filename = path.basename(existing.image);
      const filePath = path.join(uploadsDir, filename);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {}
      }
    }

    const deleted = await deleteAnalysis(id);
    if (deleted) {
      res.json({ success: true, message: 'Analysis deleted successfully' });
    } else {
      res.status(404).json({ error: 'Analysis not found' });
    }
  } catch (err) {
    console.error('Error deleting analysis:', err);
    res.status(500).json({ error: 'Failed to delete analysis' });
  }
});

// Clear all history
app.delete('/api/history', async (req, res) => {
  try {
    await clearAllAnalyses();
    
    // Clear uploads folder files
    const files = fs.readdirSync(uploadsDir);
    for (const file of files) {
      try { fs.unlinkSync(path.join(uploadsDir, file)); } catch (e) {}
    }

    res.json({ success: true, message: 'All analysis history and uploads cleared' });
  } catch (err) {
    console.error('Error clearing history:', err);
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

// Settings Endpoints
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const updated = await saveSettings(req.body);
    res.json(updated);
  } catch (err) {
    console.error('Error saving settings:', err);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// SPA Fallback for client-side routing
if (fs.existsSync(distDir)) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 BeautyAnalyzerAI Backend Server running on port ${PORT}`);
});
