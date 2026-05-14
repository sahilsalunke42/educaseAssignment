import 'dotenv/config'
import { db } from './database.js';
import express, { urlencoded } from 'express';
const app = express();


app.use(express.json())
app.use(urlencoded({extended: false}))

app.post('/addSchools', async function (req, res) {
    const { name, address, latitude, longitude } = req.body;

    if (!name || !address || !latitude || !longitude) {
        res.status(201).json({
            message: "all the fields required"
        })
        return;
    }

    const existingSchools = await db.get('schools').find({ name }).value();
    if (existingSchools) {
        res.status(201).json({
            message: "school already exists"
        })
        return;
    }

    
    const newSchool = await db.get('schools').push({ name, address, latitude, longitude }).write();

    
    res.status(200).json({
        message: "school added successfully",
        school: newSchool
    })
})



app.get('/listSchools', async function(req, res){
    const schools = db.get('schools').value();
    res.json(schools);
})





app.listen('8000')