import 'dotenv/config'
import { db } from './database';
import express, { urlencoded } from 'express';
const app = express();


app.use(express.json())
app.use(urlencoded({extended: false}))

app.post('/signup', function (req, res) {
    
})






app.listen('8000')