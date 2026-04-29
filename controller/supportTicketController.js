const { SupportTicket, ApplicationUser } = require('../model/associations');
const { sendSupportTicketToAdmissions } = require('../utils/sendSupportTicketEmail');

exports.createTicket = async (req, res) => {
    try {
        const user = await ApplicationUser.findByPk(req.params.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const subject = String(req.body.subject || '').trim();
        const message = String(req.body.message || '').trim();
        const category = req.body.category ? String(req.body.category).trim().slice(0, 100) : null;

        const row = await SupportTicket.create({
            user_id: user.id,
            user_email: user.email,
            subject,
            message,
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
                }
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
                }
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
        if (req.body.status) {
            await row.update({ status: req.body.status });
        }
        await row.reload({
            include: [{ model: ApplicationUser, as: 'user', attributes: ['id', 'email'] }]
        });
        return res.json({ success: true, message: 'Ticket updated', data: formatTicketAdmin(row) });
    } catch (error) {
        console.error('patchStatusAdmin ticket', error);
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
        raisedAt: j.created_at,
        submittedBy: j.user_email,
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
        category: j.category,
        status: j.status,
        created_at: j.created_at,
        updated_at: j.updated_at,
        user: u ? { id: u.id, email: u.email } : null
    };
}
