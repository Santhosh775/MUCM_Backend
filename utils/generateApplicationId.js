const { Op } = require('sequelize');
const Application = require('../model/applicationModel');

async function generateApplicationId() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const prefix = `APP-${y}${m}${d}`;

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const todayCount = await Application.count({
        where: {
            created_at: { [Op.between]: [todayStart, todayEnd] }
        }
    });

    const sequence = String(todayCount + 1).padStart(4, '0');
    return `${prefix}-${sequence}`;
}

module.exports = { generateApplicationId };
