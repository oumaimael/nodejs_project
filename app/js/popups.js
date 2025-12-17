// Popup functions
function showPopup(message) {
    const popupContainer = document.getElementById("popupContainer");
    if (popupContainer) {
        document.getElementById("popupMessage").textContent = message;
        popupContainer.style.display = "flex";
    } else {
        alert(message);
    }
}

function showConfirm(message) {
    return new Promise((resolve) => {
        const confirmPopup = document.getElementById("confirmPopup");
        if (!confirmPopup) {
            const result = confirm(message);
            resolve(result);
            return;
        }
        
        document.getElementById("confirmMessage").textContent = message;
        confirmPopup.style.display = "flex";
        
        const yesBtn = document.getElementById("confirmYes");
        const noBtn = document.getElementById("confirmNo");
        
        const handleYes = () => {
            cleanup();
            resolve(true);
        };
        
        const handleNo = () => {
            cleanup();
            resolve(false);
        };
        
        const cleanup = () => {
            yesBtn.removeEventListener("click", handleYes);
            noBtn.removeEventListener("click", handleNo);
            confirmPopup.style.display = "none";
        };
        
        yesBtn.addEventListener("click", handleYes);
        noBtn.addEventListener("click", handleNo);
    });
}

// Initialize popup close buttons
function initPopups() {
    const popupOk = document.getElementById("popupOk");
    if (popupOk) {
        popupOk.addEventListener("click", () => {
            document.getElementById("popupContainer").style.display = "none";
        });
    }
}