const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// JSON-Daten empfangen können
app.use(express.json());

// Frontend bereitstellen
app.use(express.static("public"));

// Speicherort der To-Dos
const dataPath = path.join(__dirname, "data", "tasks.json");

// Falls die JSON-Datei noch nicht existiert,
// wird sie automatisch erstellt.
if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(path.dirname(dataPath), { recursive: true });
    fs.writeFileSync(dataPath, "[]");
}

// To-Dos aus der JSON-Datei lesen
function readTasks() {
    return JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

// To-Dos in der JSON-Datei speichern
function saveTasks(tasks) {
    fs.writeFileSync(dataPath, JSON.stringify(tasks, null, 2));
}


// 1. Alle To-Dos abrufen
app.get("/api/tasks", (req, res) => {

    const tasks = readTasks();

    res.json(tasks);
});


// 2. Neues To-Do erstellen
app.post("/api/tasks", (req, res) => {

    const tasks = readTasks();

    const { text } = req.body;

    if (typeof text !== "string" || text.trim() === "") {
        return res.status(400).json({
            message: "Ungültiges To-Do."
        });
    }

    const newTask = {
        id: Date.now().toString(),
        text: text.trim(),
        finished: false
    };

    tasks.push(newTask);

    saveTasks(tasks);

    res.status(201).json(newTask);
});


// 3. To-Do bearbeiten oder Status ändern
app.put("/api/tasks/:id", (req, res) => {

    const tasks = readTasks();

    const task = tasks.find(t => t.id === req.params.id);

    if (!task) {
        return res.status(404).json({
            message: "To-Do nicht gefunden."
        });
    }

    const { text, finished } = req.body;

    if (text !== undefined) {
        if (typeof text !== "string" || text.trim() === "") {
            return res.status(400).json({
                message: "Ungültiger Text."
            });
        }

        task.text = text.trim();
    }

    if (finished !== undefined) {
        if (typeof finished !== "boolean") {
            return res.status(400).json({
                message: "Ungültiger Status."
            });
        }

        task.finished = finished;
    }

    saveTasks(tasks);

    res.json(task);
});


// 4. To-Do löschen
app.delete("/api/tasks/:id", (req, res) => {

    let tasks = readTasks();

    const newTasks = tasks.filter(t => t.id !== req.params.id);

    if (tasks.length === newTasks.length) {
        return res.status(404).json({
            message: "To-Do nicht gefunden."
        });
    }

    saveTasks(newTasks);

    res.json({
        message: "To-Do erfolgreich gelöscht."
    });
});


// Server starten
app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});