// Global variables for home page
let allCats = [];
let filteredCats = [];
let currentPage = 1;
const catsPerPage = 8;

// Initialize home page
document.addEventListener("DOMContentLoaded", () => {
    initAuth();
    initPopups();
    initCatForm();
    initFilters();
    loadCats();
});

// Initialize cat form functionality
function initCatForm() {
    const modal = document.getElementById("catFormModal");
    const form = document.getElementById("catForm");
    const formTitle = document.getElementById("catFormTitle");
    const submitBtn = document.getElementById("catFormSubmit");

    // Show form button
    document.getElementById("showAddFormBtn").addEventListener("click", () => {
        setupAddMode();
        modal.style.display = "flex";
    });

    // Cancel button
    document.getElementById("cancelCatForm").addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Form submit
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const catData = {
            name: document.getElementById("catName").value.trim(),
            description: document.getElementById("catDescription").value.trim(),
            tag: document.getElementById("catTag").value.trim(),
            img: document.getElementById("catImage").value.trim()
        };

        if (!catData.name) {
            showPopup("Cat name is required!");
            return;
        }

        const mode = form.dataset.mode;
        const editId = form.dataset.editId;

        if (mode === "edit" && editId) {
            await updateCat(editId, catData);
        } else {
            await addCat(catData);
        }

        modal.style.display = "none";
    });
}

// Setup add mode in the form
function setupAddMode() {
    const form = document.getElementById("catForm");
    const formTitle = document.getElementById("catFormTitle");
    const submitBtn = document.getElementById("catFormSubmit");

    // Set to add mode
    form.dataset.mode = "add";
    form.dataset.editId = "";
    formTitle.textContent = "Add New Cat";
    submitBtn.textContent = "Add Cat";

    // Clear form fields
    document.getElementById("catName").value = "";
    document.getElementById("catDescription").value = "";
    document.getElementById("catTag").value = "";
    document.getElementById("catImage").value = "";
}

// Setup edit mode in the form

function setupEditMode(cat) {
    const modal = document.getElementById("catFormModal");
    const form = document.getElementById("catForm");
    const formTitle = document.getElementById("catFormTitle");
    const submitBtn = document.getElementById("catFormSubmit");

    // Debug: Log the cat object structure
    console.log("Full cat object:", cat);
    console.log("Available properties:", Object.keys(cat));

    // Set to edit mode
    form.dataset.mode = "edit";

    // Try different possible ID properties (common variations)
    const catId = cat.id || cat._id || cat.Id || cat.ID;
    form.dataset.editId = catId;
    console.log("Using cat ID:", catId);

    formTitle.textContent = "Edit Cat";
    submitBtn.textContent = "Update Cat";

    // Try different possible property names (case insensitive)
    const catName = cat.name || cat.Name || cat.NAME || "";
    const catDescription = cat.description || cat.Description || cat.DESCRIPTION || "";
    const catTag = cat.tag || cat.Tag || cat.TAG || "";
    const catImage = cat.img || cat.image || cat.Img || cat.Image || "";

    console.log("Setting form values:", { catName, catDescription, catTag, catImage });

    // Fill form with cat data
    document.getElementById("catName").value = catName;
    document.getElementById("catDescription").value = catDescription;
    document.getElementById("catTag").value = catTag;
    document.getElementById("catImage").value = catImage;

    // Show modal
    modal.style.display = "flex";

    // Verify values are set
    setTimeout(() => {
        console.log("Actual form values:");
        console.log("Name:", document.getElementById("catName").value);
        console.log("Description:", document.getElementById("catDescription").value);
        console.log("Tag:", document.getElementById("catTag").value);
        console.log("Image:", document.getElementById("catImage").value);
    }, 100);
}

// Initialize filter functionality
function initFilters() {
    document.getElementById("searchInput").addEventListener("input", () => {
        currentPage = 1;
        filterCats();
    });

    document.getElementById("tagFilter").addEventListener("change", () => {
        currentPage = 1;
        filterCats();
    });

    document.getElementById("clearFilters").addEventListener("click", () => {
        document.getElementById("searchInput").value = "";
        document.getElementById("tagFilter").value = "";
        currentPage = 1;
        filterCats();
    });
}

// Filter cats based on search and tag
function filterCats() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase();
    const selectedTag = document.getElementById("tagFilter").value;

    filteredCats = allCats.filter(cat => {
        const matchesSearch = searchTerm === "" ||
            (cat.name && cat.name.toLowerCase().includes(searchTerm)) ||
            (cat.description && cat.description.toLowerCase().includes(searchTerm));

        const matchesTag = selectedTag === "" || cat.tag === selectedTag;

        return matchesSearch && matchesTag;
    });

    displayCurrentPage();
}

// Display current page of cats
function displayCurrentPage() {
    const grid = document.getElementById("grid");

    if (!Array.isArray(filteredCats) || filteredCats.length == 0) {
        grid.textContent = "No cats found matching your search.";
        document.getElementById("pagination").innerHTML = "";
        return;
    }

    // Calculate pagination
    const totalPages = Math.ceil(filteredCats.length / catsPerPage);
    const startIndex = (currentPage - 1) * catsPerPage;
    const endIndex = startIndex + catsPerPage;
    const pageCats = filteredCats.slice(startIndex, endIndex);

    // Display cats for current page
    grid.innerHTML = pageCats
        .map((c) => {
            const name = c.name ?? "";
            const description = c.description ?? "";
            const tag = c.tag ?? "";
            const img = c.img ?? "";
            return `
                <div class="card">
                    <div class="imgWrap">
                        ${img
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

    addCardEventListeners();
    updateActionButtons();

    updatePagination(totalPages);
}

// Add event listeners to cat cards
function addCardEventListeners() {
    const grid = document.getElementById("grid");

    // Add event listeners for delete buttons
    grid.querySelectorAll(".deleteBtn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            if (!isAdmin) {
                showPopup("Admin privileges required");
                return;
            }
            const catId = e.target.dataset.id;
            deleteCat(catId);
        });
    });

    // Add event listeners for edit buttons
    grid.querySelectorAll(".editBtn").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            if (!isAdmin) {
                showPopup("Admin privileges required");
                return;
            }
            const catId = e.target.dataset.id;

            try {
                const res = await fetch(`${API_BASE_URL}/api/cats?id=${catId}`);

                if (res.ok) {
                    const cat = await res.json();

                    // Handle both array and object responses
                    let catData;
                    if (Array.isArray(cat) && cat.length > 0) {
                        // If response is an array, take first element (like working app)
                        catData = cat[0];
                    } else if (typeof cat === 'object' && cat !== null) {
                        // If response is an object, use it directly
                        catData = cat;
                    } else {
                        showPopup("Invalid cat data received from server.");
                        return;
                    }

                    console.log("Cat data to edit:", catData);
                    setupEditMode(catData);
                } else {
                    showPopup("Failed to load cat data for editing.");
                }
            } catch (err) {
                showPopup("Error loading cat data. Please check your connection.");
                console.error(err);
            }
        });
    });
}

// Update pagination controls
function updatePagination(totalPages) {
    const pagination = document.getElementById("pagination");

    if (totalPages <= 1) {
        pagination.innerHTML = "";
        return;
    }

    let paginationHTML = '<div class="pagination-buttons">';

    // Previous button
    if (currentPage > 1) {
        paginationHTML += `<button class="page-btn prev-btn" data-page="${currentPage - 1}">← Prev</button>`;
    }

    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }

    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `<button class="page-btn next-btn" data-page="${currentPage + 1}">Next →</button>`;
    }

    paginationHTML += '</div>';

    // Add page info
    const startCat = (currentPage - 1) * catsPerPage + 1;
    const endCat = Math.min(currentPage * catsPerPage, filteredCats.length);
    paginationHTML += `<div class="pagination-info">Showing ${startCat}-${endCat} of ${filteredCats.length} cats</div>`;

    pagination.innerHTML = paginationHTML;

    // Add event listeners to pagination buttons
    pagination.querySelectorAll(".page-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            currentPage = parseInt(e.target.dataset.page);
            displayCurrentPage();
        });
    });
}

// Update tag filter options
function updateTagFilter(tags) {
    const tagFilter = document.getElementById("tagFilter");
    const currentOptions = Array.from(tagFilter.options).map(opt => opt.value);

    // Add new tags that aren't already in the filter
    tags.forEach(tag => {
        if (tag && !currentOptions.includes(tag)) {
            const option = document.createElement("option");
            option.value = tag;
            option.textContent = tag;
            tagFilter.appendChild(option);
        }
    });
}

// Add cat function
async function addCat(catData) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/cats`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(catData)
        });

        if (res.ok) {
            loadCats();
        } else {
            showPopup("Failed to add cat. Please try again.");
            console.error("Add failed:", res.status);
        }
    } catch (err) {
        showPopup("Error adding cat. Please check your connection.");
        console.error(err);
    }
}

// Update cat function

async function updateCat(catId, catData) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/cats?id=${catId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(catData)
        });

        if (res.ok) {
            const result = await res.json();
            console.log("Update successful:", result);
            showPopup("Cat updated successfully!");
            loadCats();
        } else {
            showPopup("Failed to update cat. Please try again.");
            console.error("Update failed:", res.status);
        }
    } catch (err) {
        showPopup("Error updating cat. Please check your connection.");
        console.error(err);
    }
}


// Delete cat function
async function deleteCat(catId) {
    const confirmed = await showConfirm("Are you sure you want to delete this cat?");
    if (!confirmed) return;

    try {
        const res = await fetch(`${API_BASE_URL}/api/cats?id=${catId}`, {
            method: "DELETE",
        });

        if (res.ok) {
            loadCats();
        } else {
            showPopup("Failed to delete cat. Please try again.");
            console.error("Delete failed:", res.status);
        }
    } catch (err) {
        showPopup("Error deleting cat. Please check your connection.");
        console.error(err);
    }
}

// Load cats function
async function loadCats() {
    const grid = document.getElementById("grid");
    grid.textContent = "Loading...";

    try {
        const res = await fetch(`${API_BASE_URL}/api/cats`);
        allCats = await res.json();

        if (!Array.isArray(allCats) || allCats.length == 0) {
            grid.textContent = "No cats found.";
            document.getElementById("pagination").innerHTML = "";
            return;
        }

        // Extract unique tags from all cats
        const tags = [...new Set(allCats.map(cat => cat.tag).filter(tag => tag && tag.trim() !== ""))];
        updateTagFilter(tags);

        // Reset to first page and display
        currentPage = 1;
        filteredCats = [...allCats];
        displayCurrentPage();

    } catch (err) {
        grid.textContent = "Failed to load cats.";
        document.getElementById("pagination").innerHTML = "";
        console.error(err);
    }
}
