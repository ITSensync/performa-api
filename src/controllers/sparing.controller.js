const service = require('../services/sparing2mnt.service');

exports.weeklyById = async (req, res) => {
  const result = await service.getWeeklyById(req.params.id);

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

exports.monthly = async (req, res) => {
  res.json(await service.getMonthlyPercentages());
};

exports.monthlyAll = async (req, res) => {
  const { month, year } = req.params
  // console.log(req.param)
  res.json(await service.getMonthlyByArea('all', month, year));
};

exports.monthlyBandung = async (req, res) => {
  const { month, year } = req.params

  res.json(await service.getMonthlyByArea('bandung', month, year));
};

exports.monthlyNonBandung = async (req, res) => {
  const { month, year } = req.params

  res.json(await service.getMonthlyByArea('nonbandung', month, year));
};

exports.monthlyPWK = async (req, res) => {
  const { month, year } = req.params

  res.json(await service.getMonthlyByArea('pwk', month, year));
};
