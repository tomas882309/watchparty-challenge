import express from "express";

const app = express();
const PORT = 8080;

app.get("/", (_req, res) => {
    res.send("WatchParty chat server running");
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});