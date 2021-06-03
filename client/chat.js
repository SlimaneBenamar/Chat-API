$(function () {
    //la connexion
    let socket = io.connect('http://localhost:5000');

    //les boutons et les inputs
    let message = $("#message");
    let send_message = $("#send_message");
    let chatroom = $("#chatroom");
    let feedback = $("#feedback");
    let usersList = $("#users-list");
    let nickName = $("#nickname-input");


    // onclick sur le bouton Envoyer
    send_message.click(function () {
        socket.emit('new_message', { message: message.val() })
    });
    // Lorsqu'on tape sur le bouton entrer de clavier
    message.keypress(e => {
        let keycode = (e.keyCode ? e.keyCode : e.which);
        if (keycode == '13') {
            socket.emit('new_message', { message: message.val() })
        }
    })

    //ecouter les nouveaux messages
    socket.on("new_message", (data) => {
        feedback.html('');
        message.val('');
        //afficher le nouveau message 
        chatroom.append(`
                        <div>
                            <div class="box3 sb14">
                              <p style='color:${data.color}' class="chat-text user-nickname">${data.username}</p>
                              <p class="chat-text" style="color: rgba(0,0,0,0.87)">${data.message}</p>
                            </div>
                        </div>
                        `)
        keepTheChatRoomToTheBottom()
    });

    //emis un utilisateur
    nickName.keypress(e => {
        let keycode = (e.keyCode ? e.keyCode : e.which);
        if (keycode == '13') {
            socket.emit('change_username', { nickName: nickName.val() });
            socket.on('get users', data => {
                let html = '';
                for (let i = 0; i < data.length; i++) {
                    html += `<li class="list-item" style="color: ${data[i].color}">${data[i].username}</li>`;
                }
                usersList.html(html)
            })
        }
    });

    //les frappes
    message.on("keypress", e => {
        let keycode = (e.keyCode ? e.keyCode : e.which);
        if (keycode != '13') {
            socket.emit('typing')
        }
    });

    //ecouter les frappes de clavier
    socket.on('typing', (data) => {
        feedback.html("<p><i>" + data.username + " est en train d'écrire..." + "</i></p>")
    });
});


const keepTheChatRoomToTheBottom = () => {
    const chatroom = document.getElementById('chatroom');
    chatroom.scrollTop = chatroom.scrollHeight - chatroom.clientHeight;
}
