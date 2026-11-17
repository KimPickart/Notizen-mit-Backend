document.addEventListener("DOMContentLoaded", async () => {

    // Select HTML elements
    let inputField = document.querySelector(".input-field") as HTMLInputElement;
    let enterButton = document.querySelector(".enter_button") as HTMLButtonElement;
    let ToDo = document.querySelector(".To-Do") as HTMLDivElement;

    let edit: boolean = false;
    let selectedToDo: HTMLParagraphElement | null = null;
    let selectedId: string | null = null;


    // Load all saved to-dos from the backend
    async function loadTasks(): Promise<void> {

        const response = await fetch("/api/tasks");

        const tasks = await response.json();

        ToDo.innerHTML = "";

        tasks.forEach((task: any) => {
            createTask(task);
        });
    }


    // Create a new To-do
    enterButton.addEventListener("click", async function (): Promise<void> {

        if (inputField.value.trim() === "") {
            alert("Es wurde noch keine To-do eingegeben.");
            return;
        }

        // Edit to-do
        if (edit && selectedId !== null) {

            const response = await fetch(`/api/tasks/${selectedId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    text: inputField.value
                })
            });

            if (!response.ok) {
                alert("Das To-Do konnte nicht bearbeitet werden.");
                return;
            }

            edit = false;
            selectedToDo = null;
            selectedId = null;
            inputField.value = "";

            await loadTasks();

            return;
        }


        // Send new to-do to the backend
        const response = await fetch("/api/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: inputField.value
            })
        });

        if (!response.ok) {
            alert("Das To-Do konnte nicht gespeichert werden.");
            return;
        }

        inputField.value = "";

        await loadTasks();

    });


    // Create a to-do item in HTML
    function createTask(task: any): void {

        let note = document.createElement("div");
        note.className = "note";
        ToDo.appendChild(note);


        // Status image
        let imgNotFinish = document.createElement("img");

        imgNotFinish.src = task.finished
            ? "note_with.png"
            : "note_without.png";

        imgNotFinish.className = task.finished
            ? "img_with"
            : "img_without";

        note.appendChild(imgNotFinish);


        // To-do text
        let inProgressToDo = document.createElement("p");

        inProgressToDo.className = task.finished
            ? "finish_to_do"
            : "in_progress_to_do";

        inProgressToDo.textContent = task.text;

        note.appendChild(inProgressToDo);


        // Delead-picture
        let delead = document.createElement("img");

        delead.src = "delead.png";
        delead.className = "delead";

        note.appendChild(delead);


        // Change the status
        imgNotFinish.addEventListener("click", async function (): Promise<void> {

            const response = await fetch(`/api/tasks/${task.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    finished: !task.finished
                })
            });

            if (response.ok) {
                await loadTasks();
            }

        });


        // Edit To-do
        inProgressToDo.addEventListener("click", function (): void {

            inputField.value = inProgressToDo.textContent || "";

            selectedToDo = inProgressToDo;
            selectedId = task.id;

            edit = true;

        });


        // Delead To-do
        delead.addEventListener("click", async function (): Promise<void> {

            const response = await fetch(`/api/tasks/${task.id}`, {
                method: "DELETE"
            });

            if (response.ok) {
                await loadTasks();
            }

        });

    }


    // To-dos are loaded when the website is opened
    await loadTasks();

});