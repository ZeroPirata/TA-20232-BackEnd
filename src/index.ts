import express from 'express';
import cors from 'cors';
import router from './routes';

const app = express();

app.listen(5000, ()=>{
    console.log("App is running on port 5000")
})

app.use(cors())
app.use(express.json())
app.use(router)

export default app;