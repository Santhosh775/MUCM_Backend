const { ApplicationStatusNotification } = require('../model/associations');

exports.listMyNotifications = async (req, res) => {
    try {
        const rows = await ApplicationStatusNotification.findAll({
            where: { user_id: req.portalUserId },
            order: [['created_at', 'DESC']],
            limit: 100
        });
        return res.json({ success: true, data: rows });
    } catch (error) {
        console.error('listMyNotifications', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.markMyNotificationRead = async (req, res) => {
    try {
        const row = await ApplicationStatusNotification.findOne({
            where: { id: req.params.notificationId, user_id: req.portalUserId }
        });
        if (!row) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        await row.update({ is_read: true });
        return res.json({ success: true, message: 'Notification marked as read', data: row });
    } catch (error) {
        console.error('markMyNotificationRead', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
