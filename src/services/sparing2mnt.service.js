const db = require('../config/db');

/**
 * Mapping tabel → metadata
 * Samakan dengan Laravel
 */
const SITES = {
  sparing01: { title: 'Gistex', area: 'bandung' },
  sparing02: { title: 'Indorama PWK', area: 'nonbandung' },
  // sparing03: { title: 'PMT', area: 'bandung' },
  sparing04: { title: 'Indorama PDL', area: 'bandung' },
  sparing05: { title: 'Besland', area: 'bandung' },
  sparing06: { title: 'Indotaisei', area: 'bandung' },
  sparing07: { title: 'Daliatex', area: 'bandung' },
  sparing08: { title: 'Papyrus', area: 'bandung' },
  sparing09: { title: 'BCP', area: 'bandung' },
  sparing10: { title: 'Pangjaya', area: 'bandung' },
  sparing11: { title: 'LPA', area: 'nonbandung' },
  sparing12: { title: 'Kertas PDL', area: 'bandung' },
  sparing13: { title: 'SSM', area: 'nonbandung' },
  weaving01: { title: 'Indorama PWK Weaving01', area: 'pwk' },
  weaving02: { title: 'Indorama PWK Weaving02', area: 'pwk' },
  spinning: { title: 'Indorama PWK Spinning', area: 'pwk' },
};
function getAreaTitle(area) {
  switch (area) {
    case 'bandung':
      return 'bandung site';
    case 'nonbandung':
      return 'nonbandung site';
    case 'pwk':
      return 'pwk site';
    case 'all':
    default:
      return 'all site';
  }
}

function getSitesByArea(area) {
  if (area === 'all') {
    return Object.entries(SITES).map(([id, v]) => ({
      id,
      table: id,      // nama tabel = id
      title: v.title,
      area: v.area
    }));
  }

  return Object.entries(SITES)
    .filter(([_, v]) => v.area === area)
    .map(([id, v]) => ({
      id,
      table: id,
      title: v.title,
      area: v.area
    }));
}

async function getMonthlyPercentByTable(table) {
  const sql = `
    SELECT
      COUNT(*) AS total,
      MIN(DATE(time)) AS first_date,
      MAX(DATE(time)) AS last_date
    FROM ${table}
    WHERE
      YEAR(time) = YEAR(CURDATE())
      AND MONTH(time) = MONTH(CURDATE())
  `;

  const [[row]] = await db.query(sql);

  if (!row || row.total === 0) return null;

  const start = new Date(row.first_date);
  const end = new Date(row.last_date);

  const days =
    Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

  const expected = days * 720; // interval 2 menit

  return (row.total / expected) * 100;
}


// helper format tanggal: "21 Dec"
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short'
  });
}

/**
 * WEEKLY BY ID
 * /sparing/sparing-weekly-data/{id}
 */
exports.getWeeklyById = async (id) => {
  // mapping device → table & title (samakan dengan Laravel)
  const devices = {
    sparing01: { table: 'sparing01', title: 'Gistex' },
    sparing02: { table: 'sparing02', title: 'sparing02' },
    sparing03: { table: 'sparing03', title: 'sparing03' }
    // tambahkan sampai sparing13
  };

  const device = devices[id];
  if (!device) return null;

  /**
   * LOGIKA:
   * - Tahun berjalan
   * - Bulan berjalan
   * - Week of month (BUKAN ISO week)
   * - Hanya minggu yang ADA data
   */
  const sql = `
    SELECT
      (
        WEEK(time, 1)
        - WEEK(DATE_SUB(time, INTERVAL DAYOFMONTH(time)-1 DAY), 1)
        + 1
      ) AS week,
      YEAR(time) AS year,
      MIN(DATE(time)) AS start_date,
      MAX(DATE(time)) AS end_date,
      COUNT(*) AS data_count
    FROM ${device.table}
    WHERE
      YEAR(time) = YEAR(CURDATE())
      AND MONTH(time) = MONTH(CURDATE())
    GROUP BY week, year
    ORDER BY week ASC
  `;

  const [rows] = await db.query(sql);

  const data = rows.map(row => {
    // jumlah hari dalam interval (inklusif)
    const days =
      (new Date(row.end_date) - new Date(row.start_date)) /
        (1000 * 60 * 60 * 24) + 1;

    // interval 2 menit → 720 data / hari
    const expected = days * 720;

    const percent =
      expected > 0
        ? ((row.data_count / expected) * 100).toFixed(2)
        : '0.00';

    return {
      week: row.week,
      year: row.year.toString(),
      interval_date: `${formatDate(row.start_date)} - ${formatDate(row.end_date)}`,
      data_count: row.data_count,
      percent
    };
  });

  return {
    id,
    title: device.title,
    data
  };
};

/**
 * MONTHLY PERCENTAGES (ALL ACTIVE SITES)
 * /sparing/percentages
 */
exports.getMonthlyPercentages = async () => {
  const result = [];

  for (const [table, meta] of Object.entries(SITES)) {
    const [rows] = await db.query(`
      SELECT 
        WEEK(time, 1) AS week,
        MIN(time) AS start_time,
        MAX(time) AS end_time,
        COUNT(*) AS total
      FROM ${table}
      WHERE MONTH(time) = MONTH(CURDATE())
        AND YEAR(time) = YEAR(CURDATE())
      GROUP BY week
    `);

    if (rows.length === 0) continue; // ⛔ Laravel behavior

    const weekly = rows.map(r => {
      const days = Math.ceil(
        (new Date(r.end_time) - new Date(r.start_time) + 1) / 86400000
      );
      const expected = 720 * days;

      let percent = (r.total / expected) * 100;
      if (percent > 100) percent = 100;
      return percent;
    });

    const avg =
      weekly.reduce((a, b) => a + b, 0) / weekly.length;

    result.push({
      id: table,
      title: meta.title,
      average_percent: avg.toFixed(2)
    });
  }

  return {
    status: 'OK',
    message: 'Success',
    data: result
  };
};

/**
 * MONTHLY BY AREA
 * /sparing/percentages/{area}
 */

exports.getMonthlyByArea = async (area) => {
  const sites = getSitesByArea(area);

  let sumPercent = 0;
  let validCount = 0;

  for (const site of sites) {
    const percent = await getMonthlyPercentByTable(site.table);

    if (percent !== null) {
      sumPercent += percent;
      validCount++;
    }
  }

  const avg =
    validCount > 0
      ? (sumPercent / validCount).toFixed(2)
      : '0.00';

  return {
    status: 'OK',
    message: 'Success',
    data: [
      {
        id: 'sparing', 
        title: getAreaTitle(area),
        average_percent: avg
      }
    ]
  };
};

