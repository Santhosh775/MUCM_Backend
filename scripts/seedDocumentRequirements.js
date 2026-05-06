/**
 * Seeds settings_document_requirements with the exact document fields
 * from the portal's Documents step, in the same order.
 *
 * Usage:  node scripts/seedDocumentRequirements.js
 * Safe to re-run — skips any entry that already exists by name (null tenant).
 */

require('dotenv').config()
const { connectDB, sequelize } = require('../config/db')
const { Op } = require('sequelize')
const SettingsDocumentRequirement = require('../model/settingsDocumentRequirementModel')

const DOCUMENTS = [
  {
    name: 'Passport',
    required: true,
    acceptedTypes: 'PDF,JPG,JPEG,PNG',
    maxSizeMb: 10,
  },
  {
    name: 'Bank Statement (Minimum 3 Months)',
    required: true,
    acceptedTypes: 'PDF',
    maxSizeMb: 10,
  },
  {
    name: 'Premedical / Bachelor / Undergraduate / 12th Grade Transcript',
    required: true,
    acceptedTypes: 'PDF,JPG,JPEG,PNG',
    maxSizeMb: 10,
  },
  {
    name: '11th Grade Transcript',
    required: true,
    acceptedTypes: 'PDF,JPG,JPEG,PNG',
    maxSizeMb: 10,
  },
  {
    name: 'CV / Resume',
    required: true,
    acceptedTypes: 'PDF,DOC,DOCX',
    maxSizeMb: 10,
  },
  {
    name: 'Passport-Size Photograph',
    required: true,
    acceptedTypes: 'JPG,JPEG,PNG',
    maxSizeMb: 10,
  },
  {
    name: 'Other professional transcripts / certifications / awards',
    required: false,
    acceptedTypes: 'PDF,JPG,JPEG,PNG',
    maxSizeMb: 10,
  },
  {
    name: 'Exam Results Marksheet (MCAT / NEET / UCAT)',
    required: false,
    acceptedTypes: 'PDF,JPG,JPEG,PNG',
    maxSizeMb: 10,
  },
]

async function seed() {
  await connectDB()
  const trx = await sequelize.transaction()

  try {
    let inserted = 0
    let skipped = 0

    for (let i = 0; i < DOCUMENTS.length; i++) {
      const doc = DOCUMENTS[i]

      const existing = await SettingsDocumentRequirement.findOne({
        where: {
          deleted_at: null,
          tenant_id: { [Op.is]: null },
          name: { [Op.iLike]: doc.name },
        },
        transaction: trx,
      })

      if (existing) {
        console.log(`  SKIP  "${doc.name}"`)
        skipped++
        continue
      }

      await SettingsDocumentRequirement.create(
        {
          tenant_id: null,
          name: doc.name,
          required: doc.required,
          accepted_types: doc.acceptedTypes,
          max_size_mb: doc.maxSizeMb,
          sort_order: i,
        },
        { transaction: trx },
      )

      console.log(`  INSERT "${doc.name}" — required:${doc.required}, types:${doc.acceptedTypes}, maxMB:${doc.maxSizeMb}`)
      inserted++
    }

    await trx.commit()
    console.log(`\nDone. Inserted: ${inserted}, Skipped: ${skipped}`)
  } catch (err) {
    await trx.rollback()
    console.error('Seed failed, rolled back.', err)
    process.exit(1)
  }

  process.exit(0)
}

seed()
