const db = require('../config/db');

const SITES = {
  sparing01: { title: 'Gistex', area: 'bandung', type: "tekstil" },
  sparing02: { title: 'Indorama PWK', area: 'nonbandung', type: "tekstil" },
  sparing04: { title: 'Indorama PDL', area: 'bandung', type: "tekstil" },
  sparing05: { title: 'Besland', area: 'bandung', type: "tekstil" },
  sparing06: { title: 'Indotaisei', area: 'bandung', type: "tekstil" },
  sparing07: { title: 'Daliatex', area: 'bandung', type: "tekstil" },
  sparing08: { title: 'Papyrus', area: 'bandung', type: "non-tekstil" },
  sparing09: { title: 'BCP', area: 'bandung', type: "tekstil" },
  sparing10: { title: 'Pangjaya', area: 'bandung', type: "tekstil" },
  // sparing11_lap: { title: 'LPA', area: 'nonbandung' },
  sparing12: { title: 'Kertas PDL', area: 'bandung', type: "non-tekstil" },
  sparing13: { title: 'SSM', area: 'nonbandung', type: "tekstil" },
  /*  weaving01_lap: { title: 'Indorama PWK Weaving01', area: 'pwk' },
   weaving02_lap: { title: 'Indorama PWK Weaving02', area: 'pwk' }, */
  spinning: { title: 'Indorama PWK Spinning', area: 'pwk', type: "tekstil" }
};

const BAKU_MUTU = {
  tekstil: {
    ph_min: 6,
    ph_max: 9,
    cod: 115,
    tss: 30,
    nh3n: 8
  },
  "non-tekstil": {
    ph_min: 6,
    ph_max: 9,
    cod: 175,
    tss: 80,
    // nh3n: 8
  }
};


async function getMonthlyValidityByTable(id, month, year) {
  month = Number(month);
  year = Number(year);

  const meta = SITES[id];
  if (!meta || !month || !year) return null;

  const mutu = BAKU_MUTU[meta.type];

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;

  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  const endDate = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

  if (meta.type == "tekstil") {
    const sql = `
    SELECT
      COUNT(*) AS total,
      SUM(ph BETWEEN ? AND ?) AS ph_normal,
      SUM(cod < ?) AS cod_normal,
      SUM(tss < ?) AS tss_normal,
      SUM(nh3n < ?) AS nh3n_normal
    FROM ${id}
    WHERE time >= ?
      AND time < ?
  `;

    const params = [
      mutu.ph_min,
      mutu.ph_max,
      mutu.cod,
      mutu.tss,
      mutu.nh3n,
      startDate,
      endDate
    ];

    const [[row]] = await db.query(sql, params);

    if (!row || row.total === 0) return null;

    const percent = (n) =>
      Number(((n / row.total) * 100).toFixed(2));

    return {
      total: row.total,
      ph_percent: percent(row.ph_normal),
      cod_percent: percent(row.cod_normal),
      tss_percent: percent(row.tss_normal),
      nh3n_percent: percent(row.nh3n_normal)
    };
  } else {
    const sql = `
    SELECT
      COUNT(*) AS total,
      SUM(ph BETWEEN ? AND ?) AS ph_normal,
      SUM(cod < ?) AS cod_normal,
      SUM(tss < ?) AS tss_normal
    FROM ${id}
    WHERE time >= ?
      AND time < ?
  `;

    const params = [
      mutu.ph_min,
      mutu.ph_max,
      mutu.cod,
      mutu.tss,
      startDate,
      endDate
    ];

    const [[row]] = await db.query(sql, params);

    if (!row || row.total === 0) return null;

    const percent = (n) =>
      Number(((n / row.total) * 100).toFixed(2));

    return {
      total: row.total,
      ph_percent: percent(row.ph_normal),
      cod_percent: percent(row.cod_normal),
      tss_percent: percent(row.tss_normal),
    };
  }
}

exports.getAverageMonthlyValidityBySite = async (table) => {

  const meta = SITES[table];
  if (!meta) return null;

  const mutu = BAKU_MUTU[meta.type];

  if (meta.type == "tekstil") {
    const sql = `
    SELECT
      COUNT(*) AS total,
      SUM(ph BETWEEN ? AND ?) AS ph_normal,
      SUM(cod < ?) AS cod_normal,
      SUM(tss < ?) AS tss_normal,
      SUM(nh3n < ?) AS nh3n_normal
    FROM ${table}
    WHERE MONTH(time) = MONTH(CURDATE())
        AND YEAR(time) = YEAR(CURDATE())
  `;

    const params = [
      mutu.ph_min,
      mutu.ph_max,
      mutu.cod,
      mutu.tss,
      mutu.nh3n,
    ];

    const [[row]] = await db.query(sql, params);

    if (!row || row.total === 0) return null;

    const percent = (n) =>
      Number(((n / row.total) * 100).toFixed(2));

    const average = (percent(row.ph_normal) + percent(row.cod_normal) + percent(row.tss_normal) + percent(row.nh3n_normal)) / 4;

    return average;
  } else {
    const sql = `
    SELECT
      COUNT(*) AS total,
      SUM(ph BETWEEN ? AND ?) AS ph_normal,
      SUM(cod < ?) AS cod_normal,
      SUM(tss < ?) AS tss_normal
    FROM ${table}
    WHERE MONTH(time) = MONTH(CURDATE())
        AND YEAR(time) = YEAR(CURDATE())
  `;

    const params = [
      mutu.ph_min,
      mutu.ph_max,
      mutu.cod,
      mutu.tss,
    ];

    const [[row]] = await db.query(sql, params);

    if (!row || row.total === 0) return null;

    const percent = (n) =>
      Number(((n / row.total) * 100).toFixed(2));

    const average = (percent(row.ph_normal) + percent(row.cod_normal) + percent(row.tss_normal)) / 3;

    return average;
  }
}


exports.getMonthlyValidityAllSites = async (month, year) => {
  const result = [];

  for (const [id, meta] of Object.entries(SITES)) {
    const data = await getMonthlyValidityByTable(id, month, year);

    if (!data) continue;

    result.push({
      id,
      title: meta.title,
      area: meta.area,
      ...data
    });
  }

  return {
    status: "OK",
    message: "Success",
    data: result
  };
};

