import { Router } from 'express';
import Campaign from '../models/Campaign.js';
import requireAuth from '../middleware/requireAuth.js';
import { sendOne } from '../services/mailService.js';

const router = Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.use(requireAuth);

router.get('/', async (_req, res, next) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json(campaigns);
  } catch (error) { next(error); }
});

router.get('/stats', async (_req, res, next) => {
  try {
    const [totals] = await Campaign.aggregate([{
      $group: {
        _id: null,
        campaigns: { $sum: 1 },
        sent: { $sum: '$sentCount' },
        failed: { $sum: '$failedCount' },
        recipients: { $sum: '$totalRecipients' }
      }
    }]);
    res.json(totals || { campaigns: 0, sent: 0, failed: 0, recipients: 0 });
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, subject, body, recipients } = req.body || {};
    if (!subject?.trim() || !body?.trim()) return res.status(400).json({ message: 'Subject and email body are required.' });
    if (!Array.isArray(recipients) || recipients.length === 0) return res.status(400).json({ message: 'Add at least one recipient email.' });
    if (recipients.length > 300) return res.status(400).json({ message: 'Maximum 300 recipients per campaign. Split larger lists into campaigns.' });

    const normalized = [...new Set(recipients.map(v => String(v).trim().toLowerCase()).filter(Boolean))];
    const invalid = normalized.filter(email => !emailPattern.test(email));
    if (invalid.length) return res.status(400).json({ message: `Invalid email address(es): ${invalid.slice(0, 5).join(', ')}` });

    const campaign = await Campaign.create({
      name: name?.trim() || 'Untitled campaign',
      subject: subject.trim(),
      body: body.trim(),
      totalRecipients: normalized.length,
      status: 'sending'
    });

    const results = [];
    // Send separately to protect recipient privacy and isolate individual failures.
    for (const email of normalized) {
      try {
        await sendOne({ to: email, subject: campaign.subject, body: campaign.body });
        results.push({ email, status: 'sent', error: '' });
      } catch (error) {
        console.error(`Mail failed for ${email}:`, error.message);
        results.push({ email, status: 'failed', error: error.message.slice(0, 300) });
      }
    }

    const sentCount = results.filter(r => r.status === 'sent').length;
    const failedCount = results.length - sentCount;
    campaign.recipients = results;
    campaign.sentCount = sentCount;
    campaign.failedCount = failedCount;
    campaign.status = sentCount === results.length ? 'sent' : sentCount > 0 ? 'partial' : 'failed';
    await campaign.save();

    res.status(201).json({
      message: `Campaign completed: ${sentCount} sent, ${failedCount} failed.`,
      campaign
    });
  } catch (error) { next(error); }
});

export default router;
