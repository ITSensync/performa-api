const service = require('../services/sparingHours.service');

exports.weeklyById = async (req, res) => {
  const { id, month, year } = req.params;
  const result = await service.getWeeklyById(id, month, year);

  if (!result) {
    return res.status(404).json({
      status: 'ERROR',
      message: 'Device not found'
    });
  }

  res.json({
    status: 'OK',
    message: 'Success',
    id: result.id,
    title: result.title,
    data: result.data
  });
};

exports.monthlyAll = async (req, res) => {
  const { month, year } = req.params;
  res.json(await service.getMonthlyByArea('all', Number(month), Number(year)));
};

exports.monthlyBandung = async (req, res) => {
  const { month, year } = req.params;
  res.json(await service.getMonthlyByArea('bandung', Number(month), Number(year)));
};

exports.monthlyNonBandung = async (req, res) => {
  const { month, year } = req.params;
  res.json(await service.getMonthlyByArea('nonbandung', Number(month), Number(year)));
};

exports.monthlyPWK = async (req, res) => {
  const { month, year } = req.params;
  res.json(await service.getMonthlyByArea('pwk', Number(month), Number(year)));
};
