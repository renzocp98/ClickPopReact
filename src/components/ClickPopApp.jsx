import React, { useState, useEffect } from 'react';
import { SquareGame } from './SquareGame';
import { UserForm } from './UserForm';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
 
export const ClickPopApp = () => {
    const [userSelected, setUserSelected] = useState({  
        id: 0,
        username: '',
        country: '',
        password: ''
    });

    const [stompClient, setStompClient] = useState(null);
    const [score, setScore] = useState(0);

    const handlerAdd = (user) => {
        console.log("Usuario recibido:", user);
        setUserSelected(user);
        // Puedes guardar también en el backend si lo deseas
    };

    useEffect(() => {
        const socket = new SockJS("http://localhost:8090/game-WS");
        const client = Stomp.over(socket);

        client.connect({}, () => {
            console.log("✅ Conectado a WebSocket");

            client.subscribe("/backsend/game", (message) => {
                const data = JSON.parse(message.body);
                console.log("📥 Respuesta del backend:", data);
                setScore((prev) => prev + data.points);
                // También puedes hacer una notificación visual o mostrar la validez
            });
        });

        setStompClient(client);
    }, []);

    const handleSendClick = (x, y) => {
        if (stompClient && stompClient.connected) {
            stompClient.send("/click/registerClick", {}, JSON.stringify({ x, y }));
            console.log(`📤 Enviando click: x=${x}, y=${y}`);
        } else {
            console.warn("WebSocket no conectado aún.");
        }
    };

    return (
        <div className="app-square">
            <h1 className="title">ClickPop - Juego</h1>
            <p>Puntaje actual: {score}</p>
            <UserForm userSelected={userSelected} handlerAdd={handlerAdd} />
            <SquareGame onClickSend={handleSendClick} />
        </div>
    );
};

export default ClickPopApp;
