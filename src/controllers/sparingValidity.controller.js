const service = require('../services/sparingValidities.service');

exports.validityById = async (req, res) => {
  const { id, month, year } = req.params;
  const result = await service.getMonthlyValidityAllSites(month, year);

  if (!result) {
    return res.status(404).json({
      status: 'ERROR',
      message: 'Device not found'
    });
  }

  res.json({
    status: 'OK',
    message: 'Success',
    data: result.data
  });
};