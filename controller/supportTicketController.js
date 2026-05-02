const { SupportTicket, ApplicationUser, SupportTicketCategory } = require('../model/associations');
const {
    sendSupportTicketToAdmissions,
    sendSupportTicketReplyToApplicant
} = require('../utils/sendSupportTicketEmail');

exports.createTicket = async (req, res) => {
    try {
        const user = await ApplicationUser.findByPk(req.params.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const subject = String(req.body.subject || '').trim();
        const message = String(req.body.message || '').trim();
        const categoryLabel = req.body.category ? String(req.body.category).trim().slice(0, 100) : null;
        let categoryId = req.body.category_id || null;
        let category = categoryLabel;
        if (categoryId) {
            const categoryRow = await SupportTicketCategory.findOne({
                where: { id: categoryId, deleted_at: null, is_active: true }
            });
            if (!categoryRow) {
                return res.status(400).json({ success: false, message: 'Invalid support ticket category' });
            }
            categoryId = categoryRow.id;
            category = categoryRow.name;
        }

        const row = await SupportTicket.create({
            user_id: user.id,
            user_email: user.email,
            subject,
            message,
            category_id: categoryId,
            category,
            status: 'Open'
        });

        try {
            await sendSupportTicketToAdmissions({
                ticketId: row.id,
                subject,
                message,
                applicantEmail: user.email
            });
        } catch (mailErr) {
            console.error('createTicket email', mailErr);
        }

        return res.status(201).json({
            success: true,
            message: 'Ticket submitted',
            data: formatTicket(row)
        });
    } catch (error) {
        console.error('createTicket', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.listMyTickets = async (req, res) => {
    try {
        const rows = await SupportTicket.findAll({
            where: { user_id: req.params.userId, deleted_at: null },
            include: [{ model: SupportTicketCategory, as: 'category_meta', attributes: ['id', 'name'] }],
            order: [['created_at', 'DESC']]
        });
        return res.json({ success: true, data: rows.map(formatTicket) });
    } catch (error) {
        console.error('listMyTickets', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.listAllAdmin = async (req, res) => {
    try {
        const rows = await SupportTicket.findAll({
            where: { deleted_at: null },
            include: [
                {
                    model: ApplicationUser,
                    as: 'user',
                    attributes: ['id', 'email']
                },
                { model: SupportTicketCategory, as: 'category_meta', attributes: ['id', 'name'] }
            ],
            order: [['created_at', 'DESC']]
        });
        return res.json({ success: true, data: rows.map(formatTicketAdmin) });
    } catch (error) {
        console.error('listAllAdmin tickets', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.getByIdAdmin = async (req, res) => {
    try {
        const row = await SupportTicket.findOne({
            where: { id: req.params.id, deleted_at: null },
            include: [
                {
                    model: ApplicationUser,
                    as: 'user',
                    attributes: ['id', 'email']
                },
                { model: SupportTicketCategory, as: 'category_meta', attributes: ['id', 'name'] }
            ]
        });
        if (!row) return res.status(404).json({ success: false, message: 'Ticket not found' });
        return res.json({ success: true, data: formatTicketAdmin(row) });
    } catch (error) {
        console.error('getByIdAdmin ticket', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.patchStatusAdmin = async (req, res) => {
    try {
        const row = await SupportTicket.findOne({
            where: { id: req.params.id, deleted_at: null }
        });
        if (!row) return res.status(404).json({ success: false, message: 'Ticket not found' });
        const patch = {};
        if (req.body.status) patch.status = req.body.status;
        if (req.body.admin_reply_message) {
            patch.admin_reply_message = String(req.body.admin_reply_message).trim();
            patch.admin_replied_at = new Date();
        }
        if (Object.keys(patch).length === 0) {
            return res.status(400).json({ success: false, message: 'Nothing to update' });
        }
        await row.update(patch);
        await row.reload({
            include: [
                { model: ApplicationUser, as: 'user', attributes: ['id', 'email'] },
                { model: SupportTicketCategory, as: 'category_meta', attributes: ['id', 'name'] }
            ]
        });

        if (patch.admin_reply_message) {
            const applicantEmail = row.user_email || row.user?.email;
            if (applicantEmail) {
                try {
                    await sendSupportTicketReplyToApplicant({
                        to: applicantEmail,
                        ticketId: row.id,
                        subject: row.subject,
                        replyMessage: patch.admin_reply_message
                    });
                } catch (mailErr) {
                    console.error('patchStatusAdmin reply email', mailErr);
                }
            }
        }
        return res.json({ success: true, message: 'Ticket updated', data: formatTicketAdmin(row) });
    } catch (error) {
        console.error('patchStatusAdmin ticket', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.deleteAdmin = async (req, res) => {
    try {
        const row = await SupportTicket.findOne({
            where: { id: req.params.id, deleted_at: null }
        });
        if (!row) return res.status(404).json({ success: false, message: 'Ticket not found' });

        // User requested complete deletion from admin table.
        await row.destroy();
        return res.json({ success: true, message: 'Ticket deleted' });
    } catch (error) {
        console.error('deleteAdmin ticket', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

function formatTicket(row) {
    const j = row.toJSON ? row.toJSON() : row;
    return {
        id: j.id,
        subject: j.subject,
        message: j.message,
        status: j.status,
        category: j.category,
        category_id: j.category_id || j.category_meta?.id || null,
        raisedAt: j.created_at,
        submittedBy: j.user_email,
        admin_reply_message: j.admin_reply_message,
        admin_replied_at: j.admin_replied_at,
        created_at: j.created_at,
        updated_at: j.updated_at
    };
}

function formatTicketAdmin(row) {
    const j = row.toJSON ? row.toJSON() : row;
    const u = j.user;
    return {
        id: j.id,
        user_id: j.user_id,
        applicantEmail: j.user_email || u?.email || null,
        subject: j.subject,
        message: j.message,
        category_id: j.category_id || j.category_meta?.id || null,
        category: j.category,
        status: j.status,
        admin_reply_message: j.admin_reply_message,
        admin_replied_at: j.admin_replied_at,
        created_at: j.created_at,
        updated_at: j.updated_at,
        user: u ? { id: u.id, email: u.email } : null,
        category_meta: j.category_meta ? { id: j.category_meta.id, name: j.category_meta.name } : null
    };
}
