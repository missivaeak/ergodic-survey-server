import express from 'express';
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({
    data: {
      jaha: process.env.FRONTEND_SERVER
    }
  });
});

export default router;
