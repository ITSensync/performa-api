const db = require('../config/db');

/**
 * Mapping tabel → metadata
 * PER JAM (pakai *_lap)
 */
const SITES = {
  sparing01_lap: { title: 'Gistex', area: 'bandung' },
  sparing02_lap: { title: 'Indorama PWK', area: 'nonbandung' },
  sparing04_lap: { title: 'Indorama PDL', area: 'bandung' },
  sparing05_lap: { title: 'Besland', area: 'bandung' },
  sparing06_lap: { title: 'Indotaisei', area: 'bandung' },
  sparing07_lap: { title: 'Daliatex', area: 'bandung' },
  sparing08_lap: { title: 'Papyrus', area: 'bandung' },
  sparing09_lap: { title: 'BCP', area: 'bandung' },
  sparing10_lap: { title: 'Pangjaya', area: 'bandung' },
  // sparing11_lap: { title: 'LPA', area: 'nonbandung' },
  sparing12_lap: { title: 'Kertas PDL', area: 'bandung' },
  sparing13_lap: { title: 'SSM', area: 'nonbandung' },
  weaving01_lap: { title: 'Indorama PWK Weaving01', area: 'pwk' },
  weaving02_lap: { title: 'Indorama PWK Weaving02', area: 'pwk' },
  spinning_lap: { title: 'Indorama PWK Spinning', area: 'pwk' }
};

/* ===============================
   HELPER
================================ */
function getAreaTitle(area) {
  switch (area) {
    case 'bandung': return 'bandung site';
    case 'nonbandung': return 'nonbandung site';
    case 'pwk': return 'pwk site';
    default: return 'all site';
  }
}

function getSitesByArea(area) {
  if (area === 'all') {
    return Object.keys(SITES);
  }
  return Object.keys(SITES).filter(
    t => SITES[t].area === area
  );
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short'
  });
}

/* ===============================
   MONTHLY % PER JAM (1 TABEL)
================================ */
async function getMonthlyPercentHoursByTable(table) {
  const sql = `
    SELECT
      COUNT(*) AS total,
      MIN(tanggal) AS start_date,
      MAX(tanggal) AS end_date
    FROM ${table}
    WHERE
      YEAR(tanggal) = YEAR(CURDATE())
      AND MONTH(tanggal) = MONTH(CURDATE())
  `;

  const [[row]] = await db.query(sql);
  if (!row || row.total === 0) return null;

  const days =
    Math.floor(
      (new Date(row.end_date) - new Date(row.start_date)) / 86400000
    ) + 1;

  const expected = days * 24; // ⬅️ target per jam

  return (row.total / expected) * 100;
}


/* ===============================
   WEEKLY DATA BY ID (PER JAM)
================================ */
exports.getWeeklyById = async (id, month, year) => {
  const table = `${id}`;
  if (!SITES[table]) return null;

  const sql = `
    SELECT
      (
        WEEK(tanggal, 1)
        - WEEK(DATE_SUB(tanggal, INTERVAL DAYOFMONTH(tanggal)-1 DAY), 1)
        + 1
      ) AS week,
      MIN(tanggal) AS start_date,
      MAX(tanggal) AS end_date,
      COUNT(*) AS total
    FROM ${table}
    WHERE
      YEAR(tanggal) = ?
      AND MONTH(tanggal) = ?
    GROUP BY week
    ORDER BY week
  `;

  const [rows] = await db.query(sql, [year, month]);

  const data = rows.map(r => {
    const days =
      Math.floor(
        (new Date(r.end_date) - new Date(r.start_date)) / 86400000
      ) + 1;

    const expected = days * 24; // ⬅️ per jam
    const percent =
      expected > 0
        ? ((r.total / expected) * 100).toFixed(2)
        : '0.00';

    return {
      week: r.week,
      interval_date: `${formatDate(r.start_date)} - ${formatDate(r.end_date)}`,
      data_count: r.total,
      percent
    };
  });

  return {
    id,
    title: SITES[table].title,
    data
  };
};

/* ===============================
   MONTHLY AVG BY AREA (PER JAM)
================================ */
exports.getMonthlyByArea = async (area) => {
  const tables = getSitesByArea(area);

  let sum = 0;
  let count = 0;

  for (const table of tables) {
    const percent = await getMonthlyPercentHoursByTable(table);
    if (percent !== null) {
      sum += percent;
      count++;
    }
  }

  return {
    status: 'OK',
    message: 'Success',
    data: [
      {
        id: 'sparing',
        title: getAreaTitle(area),
        average_percent:
          count > 0 ? (sum / count).toFixed(2) : '0.00'
      }
    ]
  };
};
