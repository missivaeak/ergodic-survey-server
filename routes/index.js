import express from 'express';
import { authenticate, sync } from '../models/sequelize.js';
import chapter from '../models/chapter.js';
import response from '../models/response.js'
import demographic from '../models/demographic.js'

const router = express.Router();

/* GET home page. */
router.get('/', async function(req, res, next) {
    return res.json({
        data: {
            frontendHost: process.env.FRONTEND_HOST,
            environment: process.env.NODE_ENV,
            databaseConnection: await authenticate()
        }
    });
});

router.post('/sync/:mode', async function(req, res, next) {
    return res.json(await sync(req.params.mode));
});

router.post('/sync', async function(req, res, next) {
    return res.json(await sync());
});

router.get('/chapter', async function(req, res, next) {
    return res.json(await chapter.getAll());
});

router.post('/chapter', async function(req, res, next) {
    return res.json(await chapter.add(req.body))
});

router.get('/demographic', async function(req, res, next) {
    return res.json(await demographic.getAll());
});

router.post('/demographic', async function(req, res, next) {
    return res.json(await demographic.add(req.body))
});

router.get('/response', async function(req, res, next) {
    return res.json(await response.getAll());
});

router.get('/response/:code', async function(req, res, next) {
    return res.json(await response.getOne(req.params.code));
});

router.post('/response/demographics', async function(req, res, next) {
    return res.json(await response.setDemographicData(req.body.code, req.body.responseDemographicsData));
});

router.post('/response', async function(req, res, next) {
    return res.json(await response.setChapterData(req.body.code, req.body.responseChaptersData));
});

router.get('/code', async function(req, res, next) {
    return res.json(await response.getAvailableCode());
});

export default router;
