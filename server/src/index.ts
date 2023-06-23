import express from "express";
import { addDraft, loadDraft, makePick } from './routes';
import bodyParser from 'body-parser';


// Configure and start the HTTP server.
const port = 8088;
const app = express();
app.use(bodyParser.json());
app.post("/api/add", addDraft);
app.get("/api/load", loadDraft);
app.post("/api/pick", makePick);
app.listen(port, () => console.log(`Server listening on ${port}`));
