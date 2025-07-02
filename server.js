const app = require('./app');
const connectDB = require('./backend/config/db');


connectDB();


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
