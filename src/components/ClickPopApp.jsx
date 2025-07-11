import React, { useState, useEffect } from 'react';
import { SquareGame } from './SquareGame';
import { UserForm } from './UserForm';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import axios from 'axios';

export const ClickPopApp = () => {
    const [userSelected, setUserSelected] = useState({
        id: 0,
        username: '',
        country: '',
        password: '',
        role: {
            name: 'USER' // obligatorio para que pase la validación del backend
        }
    });

    const [stompClient, setStompClient] = useState(null);
    const [score, setScore] = useState(0);

    //  Esta función ahora guarda el usuario en la base de datos
    const handlerAdd = async (user) => {
        try {
            const userWithRole = {
                ...user,
                role: { name: 'USER' } // si no lo pasas, el backend lo rechaza
            };

            const response = await axios.post('http://localhost:8090/users/register', userWithRole);
            console.log(' Usuario registrado:', response.data);
            alert('Usuario registrado correctamente');

            // Guarda en el estado de la app
            setUserSelected(response.data);
        } catch (error) {
            console.error('❌ Error al registrar usuario:', error);
            alert(error.response?.data || 'Error al registrar usuario');
        }
    };

    useEffect(() => {
        const socket = new SockJS("http://localhost:8090/game-WS");
        const client = Stomp.over(socket);

        client.connect({}, () => {
            console.log(" Conectado a WebSocket");

            client.subscribe("/backsend/game", (message) => {
                const data = JSON.parse(message.body);
                console.log(" Respuesta del backend:", data);
                setScore((prev) => prev + data.points);
            });
        });

        setStompClient(client);
    }, []);

    const handleSendClick = (x, y) => {
        if (stompClient && stompClient.connected) {
            stompClient.send("/click/registerClick", {}, JSON.stringify({ x, y }));
            console.log(` Enviando click: x=${x}, y=${y}`);
        } else {
            console.warn("WebSocket no conectado aún.");
        }
    };

    const handleStartGame = async () => {
        if (!userSelected.username || !userSelected.country || !userSelected.password) {
            alert("Debes crear un usuario antes de iniciar la partida.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:8090/game/create", userSelected);
            console.log("🎮 Juego creado:", response.data);

            const x = Math.floor(Math.random() * 300);
            const y = Math.floor(Math.random() * 300);
            handleSendClick(x, y);

        } catch (error) {
            console.error(" Error al crear el juego:", error);
            alert("No se pudo iniciar la partida. Verifica el backend.");
        }
    };

    return (
        <div className="app-square">
            <h1 className="title">ClickPop - Juego</h1>
            <p>Puntaje actual: {score}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <UserForm userSelected={userSelected} handlerAdd={handlerAdd} />
                <button onClick={handleStartGame} className="btn btn-success">
                    Iniciar partida
                </button>
            </div>

            <SquareGame onClickSend={handleSendClick} />
        </div>
    );
};

export default ClickPopApp;
