import 'dotenv/config';
import express, { urlencoded } from 'express';
import { db } from './database.js';
import { getDistance } from 'geolib';

const app = express();

app.use(express.json());
app.use(urlencoded({ extended: false }));





app.post('/addSchool', async function (req, res) {
    try {

        const { name, address, latitude, longitude } = req.body;

        if (
            name == null ||
            address == null ||
            latitude == null ||
            longitude == null
        ) {
            return res.status(400).json({
                message: 'all fields are required'
            });
        }

        const trimmedName = name.trim();
        const trimmedAddress = address.trim();

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (!trimmedName || !trimmedAddress) {
            return res.status(400).json({
                message: 'name and address cannot be empty'
            });
        }

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            return res.status(400).json({
                message: 'latitude and longitude must be valid numbers'
            });
        }

        if (lat < -90 || lat > 90) {
            return res.status(400).json({
                message: 'latitude must be between -90 and 90'
            });
        }

        if (lng < -180 || lng > 180) {
            return res.status(400).json({
                message: 'longitude must be between -180 and 180'
            });
        }

        const [result] = await db.query(
            `
            INSERT INTO schools (name, address, latitude, longitude)
            VALUES (?, ?, ?, ?)
            `,
            [trimmedName, trimmedAddress, lat, lng]
        );

        return res.status(201).json({
            message: 'school added successfully',
            schoolId: result.insertId
        });

    } catch (err) {

        console.error(err);

        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                message: 'school already exists'
            });
        }

        return res.status(500).json({
            message: 'internal server error'
        });
    }
});







app.get('/listSchools', async function (req, res) {

    try {

        const { lat, lng, latitude, longitude } = req.query;

        const userLat = parseFloat(lat ?? latitude);
        const userLng = parseFloat(lng ?? longitude);

        if (!Number.isFinite(userLat) || !Number.isFinite(userLng)) {
            return res.status(400).json({
                message: 'user latitude and longitude are required'
            });
        }

        if (userLat < -90 || userLat > 90) {
            return res.status(400).json({
                message: 'latitude must be between -90 and 90'
            });
        }

        if (userLng < -180 || userLng > 180) {
            return res.status(400).json({
                message: 'longitude must be between -180 and 180'
            });
        }

        const [schools] = await db.query(
            `
            SELECT 
                id,
                name,
                address,
                latitude,
                longitude
            FROM schools
            `
        );

        const schoolsWithDistance = schools.map((school) => {

            const distance =
                getDistance(
                    {
                        latitude: userLat,
                        longitude: userLng
                    },
                    {
                        latitude: parseFloat(school.latitude),
                        longitude: parseFloat(school.longitude)
                    }
                ) / 1000;

            return {
                ...school,
                distance_km: Number(distance.toFixed(2))
            };
        });

        schoolsWithDistance.sort((a, b) => {
            return a.distance_km - b.distance_km;
        });

        return res.status(200).json({
            total: schoolsWithDistance.length,
            schools: schoolsWithDistance
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            message: 'internal server error'
        });
    }
});






const port = process.env.PORT ?? 8000;

app.listen(port, function () {
    console.log(`server running on port ${port}`);
});