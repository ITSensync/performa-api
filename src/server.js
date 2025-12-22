const app = require('./app');

app.listen(process.env.PORT, () => {
  console.log(`🚀 Sparing API running on port ${process.env.PORT}`);
});
