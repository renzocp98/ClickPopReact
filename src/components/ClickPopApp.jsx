import React, { useState, useEffect } from 'react';
import { SquareGame } from './SquareGame';
import { UserForm } from './UserForm';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import axios from 'axios';

export const ClickPopApp = () => {
    const [userSelected, setUserSelected] = useState(null);
    const [stompClient, setStompClient] = useState(null);
    const [score, setScore] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [resetForm, setResetForm] = useState(false);
    const [pointData, setPointData] = useState(null);

    const handlerAdd = async (user) => {
        try {
            const userWithRole = {
                ...user,
                role: { name: 'USER' }
            };
            const response = await axios.post('http://localhost:8090/users/register', userWithRole);
            alert('Usuario registrado correctamente');
            setUserSelected(response.data);
            setResetForm(true);
        } catch (error) {
            alert(error.response?.data || 'Error al registrar usuario');
        }
    };

    useEffect(() => {// PROBLEMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA DOS SUBSCRIPCIONES MAAAL
        const socket = new SockJS("http://localhost:8090/game-WS");
        const client = Stomp.over(socket);

        client.connect({}, () => {
            console.log("✅ Conectado a WebSocket");

            client.subscribe("/backsend/score", (message) => {
                const data = JSON.parse(message.body);
                console.log("🎯 Puntos recibidos:", data);
                setScore((prev) => prev + data.points);
            });

            client.subscribe("/backsend/points", (message) => {
            const points = JSON.parse(message.body);
            console.log("📍 Coordenadas recibidas:", points);
            setPointData(points);
            setGameStarted(true); //  Activa el juego 
});

        });

        setStompClient(client);
    }, []);

    const handleSendClick = (x, y) => {// ENVIA CADA COORDENADA DEL CLICK
        if (stompClient && stompClient.connected) {
            stompClient.send("/click/registerClick", {}, JSON.stringify({ x, y }));
            console.log(`📤 Enviando click: x=${x}, y=${y}`);
        } else {
            console.warn("⚠️ WebSocket no conectado aún.");
        }
    };

    const handleStartGame = async () => {
        if (!userSelected?.username || !userSelected?.country || !userSelected?.password) {
            alert("Debes crear un usuario antes de iniciar la partida.");
            return;
        }

        try {
            await axios.post("http://localhost:8090/game/create", userSelected);
           // const x = Math.floor(Math.random() * 300);
           // const y = Math.floor(Math.random() * 300);
           // handleSendClick(x, y);// PUNTO GENERADO ERRONEAMENTE, NO ESTA PLANEADO
           // setGameStarted(true);
        } catch (error) {
            alert("No se pudo iniciar la partida. Verifica el backend.");
        }
    };

    useEffect(() => {
        if (resetForm) setResetForm(false);
    }, [resetForm]);

    const userLoggedIn = !!userSelected?.username;

    return (
        <div className="app-square" style={{ padding: '20px' }}>
            <h1 className="title">ClickPop - Juego</h1>

            {userLoggedIn && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                    <p style={{ fontSize: '18px' }}>Puntaje actual: {score}</p>
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                        | Usuario: {userSelected.username}
                    </span>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
                <UserForm
                    handlerAdd={handlerAdd}
                    resetForm={resetForm}
                    userSelected={userSelected}
                />
                <button
                    onClick={handleStartGame}
                    className="btn btn-success"
                    disabled={!userLoggedIn}
                    style={{
                        height: '40px',
                        marginTop: '25px',
                        backgroundColor: userLoggedIn ? '#28a745' : '#ccc',
                        borderColor: userLoggedIn ? '#28a745' : '#ccc',
                        color: userLoggedIn ? 'white' : '#666',
                        cursor: userLoggedIn ? 'pointer' : 'not-allowed'
                    }}
                >
                    Iniciar partida
                </button>
            </div>

            <SquareGame
                onClickSend={handleSendClick}
                gameStarted={gameStarted}
                pointData={pointData}
            />
        </div>
    );
};

export default ClickPopApp;
