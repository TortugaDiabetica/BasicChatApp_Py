"""
"""


from flask import Flask, render_template, request
from flask_socketio import SocketIO, disconnect, emit
import random

app = Flask(__name__)
socketio = SocketIO(app)

# Guardamos los usuarios en un dict. La key será el id del usuario, y el value contendrá el username y el avatarUrl
users = {}


# Ruta Raiz:
@app.route("/")
def index():
    return render_template("index.html")


# Estamos escuchando (esperando) el evento de conexion:
@socketio.on("connect")
def handle_connect():
    # Entregamos usuarios por defecto:
    username = f"User_{random.randint(1000, 9999)}"
    gender = random.choice(["boy", "girl"])
    avatar_api_url = f"https://avatar.iran.liara.run/public/{
        gender}?username={username}"

    users[request.sid] = {  # type: ignore
        "username": username,
        "avatar": avatar_api_url,
    }

    emit("Usuario_conectado: ", {
         "username": username, "avatar": avatar_api_url}, broadcast=True)

    # Notifica al usuario conectado cual será su nombre aleatorio:
    emit("Set_Username", {"username": username})


@socketio.on("disconnect")
def handle_disconnect():
    user = users[request.sid]  # type: ignore
    if user:
        emit("Usuario_desconectado: ", {
             "username": user["username"]}, broadcast=True)
        disconnect(user)


@socketio.on("send_message")
def handle_message(data):
    user = users.get(request.sid)  # type:ignore
    if user:
        emit("Nuevo_mensaje: ", {
            "username": user["username"],
            "avatar": user["avatar"],
            "message": data["message"],
        }, broadcast=True)


@socketio.on("update_username")
def handle_update_username(data):
    old_username = users[request.sid]["username"]  # type:ignore
    new_username = data["username"]
    users[request.sid]["username"] = new_username  # type:ignore
    emit("username_actualizado", {
        "Nombre_anterior: ": old_username,
        "Nombre_actual: ": new_username,
    }, broadcast=True)


if __name__ == "__main__":
    print("Ejecutando app")
    socketio.run(app)
