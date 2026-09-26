import { USER_ROLES } from '../constant/index.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, district } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const newUser = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role: USER_ROLES.CITIZEN,
      phone: phone || '',
      district: district || 'Al-Tal',
      badgeNumber: '',
      createdAt: new Date().toISOString()
    };

    // Simulated JWT token
    const token = Buffer.from(JSON.stringify({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name })).toString('base64');

    return res.status(201).json({
      success: true,
      message: 'Citizen registered successfully.',
      user: newUser,
      token
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Role check logic for quick login in demo or production
    let role = USER_ROLES.CITIZEN;
    let name = 'Citizen User';
    let badgeNumber = '';

    if (email.includes('admin') || email.includes('sabbagh')) {
      role = USER_ROLES.ADMINISTRATOR;
      name = 'Chief Health Director Nabil Sabbagh';
      badgeNumber = 'TRP-ADM-01';
    } else if (email.includes('officer') || email.includes('tariq') || email.includes('doctor')) {
      role = USER_ROLES.HEALTH_OFFICER;
      name = 'Dr. Tariq Al-Hajj';
      badgeNumber = 'TRP-OFF-01';
    } else {
      name = email.split('@')[0].replace('.', ' ').toUpperCase();
    }

    const user = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role,
      district: 'Al-Mina',
      badgeNumber,
      createdAt: new Date().toISOString()
    };

    const token = Buffer.from(JSON.stringify({ id: user.id, email: user.email, role: user.role, name: user.name, badgeNumber })).toString('base64');

    return res.json({
      success: true,
      message: 'Login successful.',
      user,
      token
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
