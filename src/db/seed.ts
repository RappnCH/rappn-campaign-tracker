import pool from './connection';

async function seed() {
  try {
    console.log('Seeding database with initial campaigns...');

    // Campaign 1: Zurich — Cheapest Basket (DE)
    await pool.query(
      `INSERT INTO campaigns 
        (campaign_id, name, date_start, date_end, geo, primary_channel, type, concept, language, status, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (campaign_id) DO NOTHING`,
      [
        '2025-10_ZH-FB-PAID-BASKET-DE',
        'Zurich — Cheapest Basket (DE)',
        '2025-10-01',
        '2025-10-31',
        'ZH',
        'FB',
        'PAID',
        'Cheapest Basket',
        'DE',
        'active',
        'Facebook paid campaign targeting German speakers in Zurich, promoting the cheapest basket offering.',
      ]
    );

    // Campaign 2: Genève — Mixed Route (FR)
    await pool.query(
      `INSERT INTO campaigns 
        (campaign_id, name, date_start, date_end, geo, primary_channel, type, concept, language, status, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (campaign_id) DO NOTHING`,
      [
        '2025-11_GE-MULTI-ORGANIC-MIXED-ROUTE-FR',
        'Genève — Mixed Route (FR)',
        '2025-11-01',
        '2025-11-30',
        'GE',
        'MULTI',
        'ORGANIC',
        'Mixed Route',
        'FR',
        'active',
        'Multi-channel organic campaign for French speakers in Geneva, featuring mixed delivery routes.',
      ]
    );

    console.log('✅ Seed data inserted successfully');
    console.log('   - 2025-10_ZH-FB-PAID-BASKET-DE (Zurich — Cheapest Basket)');
    console.log('   - 2025-11_GE-MULTI-ORGANIC-MIXED-ROUTE-FR (Genève — Mixed Route)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
