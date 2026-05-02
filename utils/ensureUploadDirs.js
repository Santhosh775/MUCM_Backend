const fs = require('fs');
const path = require('path');

/**
 * Ensures upload directories exist. Application uploads use uploads/applications/:applicationUuid/.
 * Blank PDFs and downloadable templates live under uploads/forms/ (served at GET /forms/...).
 */
function ensureUploadDirs() {
    const root = path.join(process.cwd(), 'uploads');
    const applications = path.join(root, 'applications');
    const forms = path.join(root, 'forms');
    fs.mkdirSync(applications, { recursive: true });
    fs.mkdirSync(forms, { recursive: true });
}

module.exports = { ensureUploadDirs };
