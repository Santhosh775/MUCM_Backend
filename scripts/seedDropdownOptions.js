/**
 * Seeds dropdown_option_categories + dropdown_option_values with the static
 * values used in the application portal form.
 *
 * Usage:  node scripts/seedDropdownOptions.js
 * Safe to re-run — skips any category that already exists (by name, null tenant).
 */

require('dotenv').config();
const { connectDB, sequelize } = require('../config/db');
const { Op } = require('sequelize');
const DropdownOptionCategory = require('../model/dropdownOptionCategoryModel');
const DropdownOptionValue = require('../model/dropdownOptionValueModel');

const CATEGORIES = [
  {
    category: 'Personal Details - Title',
    description: 'Salutation / title options for personal details',
    options: ['Mr', 'Mrs', 'Ms', 'Mx', 'Dr', 'Other'],
  },
  {
    category: 'Personal Details - Pronouns',
    description: 'Pronoun options for personal details',
    options: ['He/Him', 'She/Her', 'They/Them', 'Prefer not to say', 'Other'],
  },
  {
    category: 'Personal Details - Gender',
    description: 'Gender identity options for personal details',
    options: ['Male', 'Female', 'Non-binary', 'Prefer not to say'],
  },
  {
    category: 'Personal Details - Ethnicity',
    description: 'Ethnicity options for personal details',
    options: [
      'African / Black',
      'Asian',
      'Caribbean',
      'European / White',
      'Hispanic / Latino',
      'Middle Eastern / North African',
      'Mixed / Multiple Ethnic Groups',
      'Pacific Islander',
      'South Asian',
      'Prefer not to say',
      'Other',
    ],
  },
  {
    category: 'Personal Details - Visa/Immigration Status',
    description: 'Visa or immigration status options for personal details',
    options: [
      'Citizen',
      'Permanent Resident',
      'Student Visa (F-1 / J-1)',
      'Work Visa',
      'Tourist / Visitor Visa',
      'Refugee / Asylum Status',
      'No Visa Required',
      'Will Need Student Visa',
      'Other',
    ],
  },
  {
    category: 'Emergency Contact - Relationship',
    description: 'Relationship options for emergency contact',
    options: ['Parent', 'Spouse', 'Sibling', 'Guardian', 'Uncle/Aunt', 'Grandparent', 'Friend', 'Other'],
  },
  {
    category: 'Admission Sought - Preferred Semester',
    description: 'Preferred semester options for admission sought',
    options: ['Spring (January)', 'Summer (May)', 'Fall (September)'],
  },
  {
    category: 'Admission Sought - Preferred Year',
    description: 'Preferred intake year options for admission sought',
    options: ['2026', '2027', '2028', '2029'],
  },
  {
    category: 'English Language Proficiency - Proficiency Level',
    description: 'English proficiency level options',
    options: ['Speaking and writing'],
  },
  {
    category: 'English Language Proficiency - Test Type',
    description: 'English language test type options',
    options: [
      'TOEFL iBT',
      'IELTS Academic',
      'PTE Academic',
      'Duolingo English Test',
      'Cambridge C1/C2',
      'Not Applicable',
    ],
  },
  {
    category: 'Standardized Tests - Test Type',
    description: 'Standardized test type options',
    options: ['MCAT', 'UCAT', 'GAMSAT', 'BMAT', 'NEET', 'Not Applicable'],
  },
  {
    category: 'Experience & Motivation - Type of Experience',
    description: 'Type of experience options for experience & motivation section',
    options: [
      'Clinical Experience',
      'Research',
      'Volunteer / Community Service',
      'Shadowing',
      'Leadership',
      'Teaching / Tutoring',
      'Employment',
      'Extracurricular Activity',
      'Other',
    ],
  },
  {
    category: 'Disclosures - Referral Source',
    description: 'How did you hear about us options for disclosures',
    options: [
      'Search Engine (Google, Bing, etc.)',
      'Social Media (Facebook, Instagram, etc.)',
      'Friend or Family Referral',
      'Education Agent / Consultant',
      'University Fair / Event',
      'Online Advertisement',
      'News Article / Blog',
      'WhatsApp',
      'YouTube',
      'Current Student / Alumni Referral',
      'Embassy / Consulate',
      'Other',
    ],
  },
];

async function seed() {
  await connectDB();
  const trx = await sequelize.transaction();

  try {
    let inserted = 0;
    let skipped = 0;

    for (const { category, description, options } of CATEGORIES) {
      // Check if already exists (null tenant)
      const existing = await DropdownOptionCategory.findOne({
        where: {
          deleted_at: null,
          tenant_id: { [Op.is]: null },
          category: { [Op.iLike]: category },
        },
        transaction: trx,
      });

      if (existing) {
        console.log(`  SKIP  "${category}" (already exists)`);
        skipped++;
        continue;
      }

      const cat = await DropdownOptionCategory.create(
        { tenant_id: null, category, description },
        { transaction: trx }
      );

      await DropdownOptionValue.bulkCreate(
        options.map((option_value, idx) => ({
          category_id: cat.id,
          option_value,
          sort_order: idx,
        })),
        { transaction: trx }
      );

      console.log(`  INSERT "${category}" — ${options.length} options`);
      inserted++;
    }

    await trx.commit();
    console.log(`\nDone. Inserted: ${inserted}, Skipped: ${skipped}`);
  } catch (err) {
    await trx.rollback();
    console.error('Seed failed, rolled back.', err);
    process.exit(1);
  }

  process.exit(0);
}

seed();
