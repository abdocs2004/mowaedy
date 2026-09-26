import { Category } from '../models/Category.js';
import { Provider } from '../models/Provider.js';
import { Service } from '../models/Service.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { escapeRegex, getPagination, pageMeta } from '../utils/pagination.js';
import { todayStr } from '../utils/time.js';
import { getAvailability, getSlotsForDate } from '../services/slotService.js';

const PUBLIC_SELECT = '-owner -__v';
const CATEGORY_POPULATE = { path: 'category', select: 'slug nameAr singularAr icon' };

/** Public list with search + filters + pagination. */
export const listProviders = asyncHandler(async (req, res) => {
  const { q, category, location, service, sort } = req.query;
  const pg = getPagination(req.query, { defaultLimit: 12, maxLimit: 50 });
  const filter = { isActive: true };
  const and = [];

  if (category) {
    const cat = await Category.findOne({ slug: category, isActive: true }).select('_id');
    if (!cat) return res.json({ data: [], meta: pageMeta(0, pg) });
    filter.category = cat._id;
  } else {
    const activeCats = await Category.find({ isActive: true }).select('_id');
    filter.category = { $in: activeCats.map((c) => c._id) };
  }
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    and.push({ $or: [{ name: rx }, { businessName: rx }, { description: rx }] });
  }
  if (location) {
    const rx = new RegExp(escapeRegex(location), 'i');
    and.push({ $or: [{ city: rx }, { address: rx }] });
  }
  if (service) {
    const rx = new RegExp(escapeRegex(service), 'i');
    const matches = await Service.find({ name: rx, isActive: true }).select('provider').lean();
    and.push({ _id: { $in: [...new Set(matches.map((m) => String(m.provider)))] } });
  }
  if (and.length) filter.$and = and;

  const sortBy = { rating: { 'rating.avg': -1, 'rating.count': -1, name: 1 }, name: { name: 1 }, newest: { createdAt: -1 } }[sort || 'rating'];

  const [total, providers] = await Promise.all([
    Provider.countDocuments(filter),
    Provider.find(filter).select(PUBLIC_SELECT).populate(CATEGORY_POPULATE).sort(sortBy).skip(pg.skip).limit(pg.limit),
  ]);

  // Attach "starting price" so cards can show it without an extra request per card.
  const ids = providers.map((p) => p._id);
  const services = await Service.find({ provider: { $in: ids }, isActive: true }).select('provider price').lean();
  const minPrice = new Map();
  for (const s of services) {
    const key = String(s.provider);
    if (!minPrice.has(key) || s.price < minPrice.get(key)) minPrice.set(key, s.price);
  }
  const data = providers.map((p) => ({ ...p.toJSON(), startingPrice: minPrice.get(String(p._id)) ?? null }));
  res.json({ data, meta: pageMeta(total, pg) });
});

/** Distinct cities of active providers, for the location filter. */
export const listLocations = asyncHandler(async (_req, res) => {
  const cities = await Provider.distinct('city', { isActive: true });
  res.json({ data: cities.filter(Boolean).sort((a, b) => a.localeCompare(b, 'ar')) });
});

export const getProvider = asyncHandler(async (req, res) => {
  const provider = await Provider.findOne({ _id: req.params.id, isActive: true }).select(PUBLIC_SELECT).populate(CATEGORY_POPULATE);
  if (!provider) throw AppError.notFound('مقدم الخدمة غير موجود');
  const services = await Service.find({ provider: provider._id, isActive: true }).sort({ price: 1 });
  res.json({ data: { ...provider.toJSON(), services } });
});

async function loadProviderAndService(providerId, serviceId) {
  const provider = await Provider.findOne({ _id: providerId, isActive: true });
  if (!provider) throw AppError.notFound('مقدم الخدمة غير موجود');
  const service = await Service.findOne({ _id: serviceId, provider: provider._id, isActive: true });
  if (!service) throw AppError.notFound('الخدمة غير موجودة لدى مقدم الخدمة هذا');
  return { provider, service };
}

export const getSlots = asyncHandler(async (req, res) => {
  const { serviceId, date } = req.query;
  const { provider, service } = await loadProviderAndService(req.params.id, serviceId);
  const slots = await getSlotsForDate(provider, service, date);
  res.json({ data: { date, serviceId, slots } });
});

export const getProviderAvailability = asyncHandler(async (req, res) => {
  const { serviceId, from, days } = req.query;
  const { provider, service } = await loadProviderAndService(req.params.id, serviceId);
  const span = Math.min(days || 14, provider.maxAdvanceDays + 1);
  const data = await getAvailability(provider, service, from || todayStr(), span);
  res.json({ data });
});
