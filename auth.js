const loginModal = document.getElementById("login-modal");
const loginForm = document.getElementById("login-form");

document.addEventListener("DOMContentLoaded", function () {
    // Mostrar modal de login al cargar la página
    loginModal.style.display = "block";

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const response = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.token);
            loginModal.style.display = "none"; // Cerrar modal tras login exitoso
        } else {
            alert(data.error);
        }
    });
});

function closeModalLogin() {
    document.getElementById("login-modal").style.display = "none";
}

const registroModal = document.getElementById("registro-modal");
const registerForm = document.getElementById("register-form");

document.getElementById("registro-btn").addEventListener("click",  () => {
    closeModalLogin(); // Cerrar modal de login al abrir el de registro
    registroModal.style.display = "block"; // Mostrar modal de registro al oprimir el botón
});

registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    
    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, apellido, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
        alert("Registro exitoso. Redirigiendo a pago...");

        // Obtener el user_id del backend
        const userResponse = await fetch(`http://localhost:5000/get_user_id?email=${email}`);
        const userData = await userResponse.json();

        if (userResponse.ok) {
            const userId = userData.user_id;

            // Redirigir al usuario a la página de pago
            const pagoResponse = await fetch(`http://localhost:5000/pagar_membresia/${userId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });

            const pagoData = await pagoResponse.json();

            if (pagoResponse.ok) {
                window.location.href = pagoData.init_point; // Redirige al pago de MercadoPago
            } else {
                alert("Error al generar el enlace de pago.");
            }
        } else {
            alert("Error al obtener el ID del usuario.");
        }
    } else {
        alert(data.error);
    }
});

function closeModalRegistro() {
    document.getElementById("registro-modal").style.display = "none";
}