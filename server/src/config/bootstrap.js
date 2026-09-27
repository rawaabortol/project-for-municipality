import User from '../models/User.js';
import CategoryService from '../service/category.service.js';
import { hashPassword } from '../service/auth.service.js';
import { USER_ROLES } from '../constant/index.js';

/**
 * Creates the first administrator from ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME
 * when no administrator exists yet. Public registration only creates citizens,
 * so this is how the first admin account comes to exist.
 */
const ensureAdminAccount = async () => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
  if (await User.exists({ role: USER_ROLES.ADMINISTRATOR })) return;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.warn('[Bootstrap] No administrator exists. Set ADMIN_EMAIL and ADMIN_PASSWORD to create one.');
    return;
  }

  const email = ADMIN_EMAIL.trim().toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = USER_ROLES.ADMINISTRATOR;
    existing.badgeNumber = existing.badgeNumber || 'TRP-ADM-001';
    await existing.save();
  } else {
    await User.create({
      name: ADMIN_NAME || 'Health Directorate Administrator',
      email,
      password: await hashPassword(ADMIN_PASSWORD),
      role: USER_ROLES.ADMINISTRATOR,
      badgeNumber: 'TRP-ADM-001',
      title: 'Health Directorate Administrator',
    });
  }
  console.log(`[Bootstrap] Administrator account ready: ${email}`);
};

export const bootstrapData = async () => {
  const seeded = await CategoryService.seedDefaultCategories();
  if (seeded) console.log(`[Bootstrap] Seeded ${seeded} default report categories`);
  await ensureAdminAccount();
};
