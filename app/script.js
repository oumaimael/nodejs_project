
async function loadCats() {
    const grid = document.getElementById("grid");
    grid.textContent = "Loading...";

    try {
        const res = await fetch("http://localhost:5000/cats");
        const cats = await res.json();

        if (!Array.isArray(cats) || cats.length == 0) {
            grid.textContent = "No cats found.";
            return;
        }

        grid.innerHTML = cats
            .map((c) => {
                const name = c.name ?? "";
                const description = c.description ?? "";
                const tag = c.tag ?? "";
                const img = c.img ?? "";
                return `
                    <div class="card">
                        <div class="imgWrap">
                            ${
                                img
                                    ? `<img src="${img}" alt="${name}" />`
                                    : `<div class="imgFallback">No image</div>`
                            }
                        </div>
                        <h3>${name}</h3>
                        <p>${description}</p>
                        ${tag ? `<div class="tag">${tag}</div>` : ""}
                        <div class="actions">
                            <button class="editBtn" data-id="${c.id}">Edit</button>
                            <button class="deleteBtn" data-id="${c.id}">Delete</button>
                        </div>
                    </div>
                `;
            })
            .join("");
    } catch (err) {
        grid.textContent = "Failed to load cats.";
        console.error(err);
    }

}
loadCats();