const socket = io();
// Username Container:
const currentUsernameSpan = document.getElementById("current-username");
const usernameInput = document.getElementById("username-input");
const updateUsernameButton = document.getElementById("update-username-button");

// Chat messages section:
const chatMessages = document.getElementById("chat-messages");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");


let currentUsername = "";


// Enviamos el mensaje a nuestro backend:
const sendMessage = () => {
  // Formateamos el texto recibido para envio limpio al back
  const message = messageInput.value.trim();
  if (message) {
    socket.emit("send_message", { message })
    messageInput.value = "";
  }
}

// Manejo de evento del boton "Cambiar nombre":
const updateUsername = () => {
  const newUsername = usernameInput.value.trim();
  if (newUsername && newUsername != currentUsername) {
    // Entregamos el nuevo nombre al backend
    socket.emit("update_username", { username: newUsername })
    usernameInput.value = "";
  }
}

// Funcion encargada de actualizar y mostrar el estado UI de los mensajes 
// enviados por los usuarios en pantalla:
const addMessage = (message, type, username = "", avatar = "") => {
  const messageElement = document.createElement("div");
  messageElement.className = "message";

  if (type === "user") {
    const isSentMessage = username === currentUsername;
    if (isSentMessage) {
      messageElement.classList.add("sent");
    }

    const avatarImg = document.createElement("img");
    avatarImg.src = avatar;
    messageElement.appendChild(avatarImg);

    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";

    const usernameDiv = document.createElement("div");
    usernameDiv.className = "message-username";
    usernameDiv.textContent = username;
    contentDiv.appendChild(usernameDiv)

    const messagesText = document.createElement("div");
    messagesText.textContent = message;
    contentDiv.appendChild(messagesText);

    messageElement.appendChild(contentDiv);

  } else {
    messageElement.className = "system-message";
    messageElement.textContent = message;
  }

  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}


// Inicializadores de los eventos principales:
sendButton.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
})
updateUsernameButton.addEventListener("click", updateUsername);


// Funciones encargadas de enviar la data al backend:
socket.on("set_username", (data) => {
  currentUsername = data.username;
  currentUsernameSpan.textContent = `Tu nombre de usuario: ${currentUsername}`;
})

socket.on("user_joined", (data) => {
  addMessage(`${data.username} Se ha unido al chat`, "system");
})

socket.on("user_left", (data) => {
  addMessage(`${data.username} ha abandonado el chat`, "system");
})

socket.on("new_message", (data) => {
  addMessage(data.message, "user", data.username, data.avatar);
})

socket.on("username_updated", (data) => {
  addMessage(`${data.old_username} Cambió su nombre a ${data.new_username}`, "system");

  // Maneja situacion de posible usuario sin nombre previo:
  if (data.old_username === currentUsername) {
    currentUsername = data.new_username;
    currentUsernameSpan.textContent = `Tu nombre de usuario: ${currentUsername}`;
  }
})

