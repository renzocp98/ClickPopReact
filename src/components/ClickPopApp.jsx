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

   // const handlerAdd = async (user) => {
   //     try {
   //         const userWithRole = {
   //             ...user,
   //             role: { name: 'USER' }
   //         };
   //         const response = await axios.post('http://localhost:8090/users/register', userWithRole);
   //         alert('Usuario registrado correctamente');
   //         setUserSelected(response.data);
   //         setResetForm(true);
   //     } catch (error) {
   //         alert(error.response?.data || 'Error al registrar usuario');
   //     }
   // };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUserSelected(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
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
                setGameStarted(true);
            });
        });

        setStompClient(client);
    }, []);

    useEffect(() => {
        if (resetForm) setResetForm(false);
    }, [resetForm]);

    const handleSendClick = (x, y) => {
        if (stompClient && stompClient.connected) {
            stompClient.send("/click/registerClick", {}, JSON.stringify({ x, y }));
            console.log(`📤 Enviando click: x=${x}, y=${y}`);
        }else {
            console.warn("⚠️ WebSocket no conectado aún.");
        }
    };

    const handleStartGame = async () => {
        if (!userSelected?.username || !userSelected?.password) {
            alert("Debes iniciar sesión o crear un usuario.");
            return;
        }

        try {
            await axios.post("http://localhost:8090/game/create", userSelected);
        } catch (error) {
            alert("No se pudo iniciar la partida. Verifica el backend.");
        }
    };

    const handleRegister = async (userFormData) => {
        const userToCreate = {
            ...userFormData,
            role: { name: 'USER' }
        };

        try {
            const response = await axios.post('http://localhost:8090/users/register', userToCreate);
            alert('Usuario registrado correctamente');
            localStorage.setItem('user', JSON.stringify(response.data));
            setUserSelected(response.data);
            setResetForm(true);
        } catch (error) {
            alert(error.response?.data || 'Error al registrar usuario');
        }
    };

    //const handleLogin = async (userFormData) => {
    //    try {
    //        await axios.post('http://localhost:8090/SessionInfo/login', userFormData);
    //        alert("Inicio de sesión exitoso");
    //        localStorage.setItem('user', JSON.stringify(userFormData));
    //        setUserSelected(userFormData);
    //    } catch (error) {
    //        alert("Error al iniciar sesión");
    //    }
    //};

    const handleLogin = async (formUser) => {
    try {
        // Inicias sesión
        console.log("Datos que se están enviando:", formUser)
        await axios.post('http://localhost:8090/SessionInfo/login', formUser);

        // Pides los datos completos del usuario
        const userResponse = await axios.get(`http://localhost:8090/users/username/${formUser.username}`);

        const userData = userResponse.data;

        // Guardas todo bien
        alert("Inicio de sesión exitoso");
        localStorage.setItem('user', JSON.stringify(userData));
        setUserSelected(userData);
    } catch (error) {
        alert("Error al iniciar sesión");
    }
};


    const handleLogout = async () => {
        try {
            await axios.post("http://localhost:8090/SessionInfo/logout");
            localStorage.removeItem('user');
            setUserSelected(null);
            setResetForm(true);
        } catch (error) {
            alert("Error al cerrar sesión");
        }
    };

    return (
        <div className="app-square" style={{ padding: '20px' }}>
            <h1 className="title">ClickPop - Juego</h1>

            {userSelected && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                    <p style={{ fontSize: '18px' }}>Puntaje actual: {score}</p>
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                        | Usuario: {userSelected.username}
                    </span>
                    <button onClick={handleLogout} style={{ marginLeft: '20px' }}>Cerrar sesión</button>
                </div>
            )}

            {!userSelected && (
                <div className="user-form-container" style={{ marginBottom: '20px' }}>
                    <UserForm
                        handlerAdd={handleRegister}
                        handlerLogin={handleLogin}
                        resetForm={resetForm}
                        userSelected={userSelected}
                    />
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                <button
                    onClick={handleStartGame}
                    className="btn btn-success"
                    disabled={!userSelected}
                    style={{
                        height: '40px',
                        marginTop: '10px',
                        backgroundColor: userSelected ? '#28a745' : '#ccc',
                        borderColor: userSelected ? '#28a745' : '#ccc',
                        color: userSelected ? 'white' : '#666',
                        cursor: userSelected ? 'pointer' : 'not-allowed'
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
