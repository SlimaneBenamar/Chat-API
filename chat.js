const express = require('express');
const app = express();
let randomColor = require('randomcolor');
const uuid = require('uuid');


app.disable('x-powered-by')

//middlewares
app.use(express.static('client'));

//la route vers le fichier index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/index.html');
});

//
server = app.listen(process.env.PORT || 5000);

//socket.io instantiation
const io = require("socket.io")(server);

let users = [];
let connnections = [];

//ecouter les connexions
io.on('connection', (socket) => {
    console.log('un nouveau utilisateur à été connecté');
    connnections.push(socket)
    //initialiser les couleurs aleatoire
    let color = randomColor();

    socket.username = 'Anonymous';
    socket.color = color;


    socket.on('change_username', data => {
        let id = uuid.v4(); // creer un id aleatoire
        socket.id = id;
        socket.username = data.nickName;
        users.push({ id, username: socket.username, color: socket.color });
        updateUsernames();
    })

    const updateUsernames = () => {
        io.sockets.emit('get users', users)
    }

    //ecouter les nouveaux messages
    socket.on('new_message', (data) => {
        io.sockets.emit('new_message', { message: data.message, username: socket.username, color: socket.color });
    })

    //ecouter les frappes de clavier
    socket.on('typing', data => {
        socket.broadcast.emit('typing', { username: socket.username })
    })

    //Deconnexion
    socket.on('disconnect', data => {

        if (!socket.username)
            return;

        let user = undefined;
        for (let i = 0; i < users.length; i++) {
            if (users[i].id === socket.id) {
                user = users[i];
                break;
            }
        }
        users = users.filter(x => x !== user);
        //mise a jour de la liste des utilisateurs
        updateUsernames();
        connnections.splice(connnections.indexOf(socket), 1);
    })
})
