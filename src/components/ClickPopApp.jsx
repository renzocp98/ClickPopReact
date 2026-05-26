import React, { useState, useEffect, useRef} from 'react';
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
    const [correctPoints, setCorrectPoints] = useState([]);
    const lastClickRef = useRef(null);
    const [currentGame, setCurrentGame] = useState(null);

// Recuperacion de datos del almacen local si hay datos en el
    useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        setUserSelected(JSON.parse(storedUser));
    }

    const storedPoints = localStorage.getItem("pointData");
    if (storedPoints) {
        setPointData(JSON.parse(storedPoints));
        setGameStarted(true);
    }

    const storedScore = localStorage.getItem('score');
    if (storedScore) {
        setScore(JSON.parse(storedScore));
    }
    const storedGame = localStorage.getItem("currentGame");
    if (storedGame) {
        setCurrentGame(JSON.parse(storedGame));
    }
    }, []);

//Guarda los puntos del juego cada vez que cambian
    useEffect(() => {
      if (pointData) {
        localStorage.setItem('pointData', JSON.stringify(pointData));
      }
    }, [pointData]);
    
//Guarda la puntuaciond de la partida cada vez que cambian
    useEffect(() => {
      if (score !== null) {
        localStorage.setItem('score', JSON.stringify(score));
      }
    }, [score]);

//    Temmas relacionados con la conexion websocket    
    useEffect(() => {
        const socket = new SockJS("http://localhost:8090/game-WS");
        const client = Stomp.over(socket);

        //Conexion a canal de websocket
        client.connect({}, () => {
            console.log("✅ Conectado a WebSocket");

            client.unsubscribe("score-sub");

            console.log("🧪 Suscribiéndome al canal /backsend/score");


            
            //Conexion a comunicacion para la puntuacion
            client.subscribe("/backsend/score", (message) => {
                console.log("📬 Suscripción a /backsend/score registrada");

                const data = JSON.parse(message.body);
                console.log("🎯 Puntos recibidos:", data);
                const { valid, points } = data;
                setScore(() => points);
                localStorage.setItem("score", JSON.stringify(points));

               

                if (valid && lastClickRef.current && pointData?.points) {
                     const { x, y } = lastClickRef.current;

                    const updatedPoints = pointData.points.filter(([px, py]) => {
                        const distance = Math.sqrt((px - x) ** 2 + (py - y) ** 2);
                        return distance > 5; // tolerancia de acierto, puedes ajustar
                    });

                    const newPointData = { ...pointData, points: updatedPoints };
                    setPointData(newPointData);
                    localStorage.setItem("pointData", JSON.stringify(newPointData));
                }

            }, { id: "score-sub" });

            console.log("📡 Intentando conectar WebSocket...");

            //Conexion a comunicacion de puntos
            client.subscribe("/backsend/points", (message) => {
                const points = JSON.parse(message.body);
                console.log("📍 Coordenadas recibidas:", points);
                setPointData(points);
                setGameStarted(true);
                localStorage.setItem("pointData", JSON.stringify(points));
            });
        });

        setStompClient(client);
        return () => {
            client.disconnect(() => {
              console.log("🔌 Desconectado de WebSocket");
            });
        };
    }, [])

    // Reset de variable, para permitir futuros reinicios
    useEffect(() => {
        if (resetForm) setResetForm(false);
    }, [resetForm]);


    const handleEndGame = async () => {
        if (!currentGame) {
            alert("No hay partida activa.");
            return;
        }

        try {
            await axios.put(`http://localhost:8090/game/score/${score}`, currentGame);
            alert("Puntaje guardado con éxito.");
            setCurrentGame(null); // Resetea para una nueva partida
            setScore(0);
            setGameStarted(false);
            setPointData(null);
            setCorrectPoints([]);
            localStorage.removeItem("currentGame");
        } catch (error) {
            console.error("Error al terminar partida:", error);
            alert("No se pudo guardar el puntaje.");
        }
    };



    const handleSendClick = (x, y) => {
    if (stompClient && stompClient.connected) {
        stompClient.send("/click/registerClick", {}, JSON.stringify({ x, y }));
        lastClickRef.current = { x, y };

        if (pointData?.points) {
            const closest = pointData.points.reduce((closestPoint, point) => {
                const [px, py] = point;
                const dist = Math.hypot(px - x, py - y);
                return !closestPoint || dist < closestPoint.dist
                    ? { point, dist }
                    : closestPoint;
            }, null);

            if (closest && closest.dist <= 8) { // radio de acierto
                const [cx, cy] = closest.point;

                const alreadyCorrect = correctPoints.some(
                    ([gx, gy]) => gx === cx && gy === cy
                );

                if (!alreadyCorrect) {
                    setCorrectPoints([...correctPoints, [cx, cy]]);
                }
            }
        }
    } else {
            console.warn("⚠️ WebSocket no conectado aún.");
        }
    };    

    const handleStartGame = async () => {
        if (!userSelected?.username || !userSelected?.password) {
            alert("Debes iniciar sesión o crear un usuario.");
            return;
        }

        // Resetear ANTES del await para no sobreescribir los puntos
        // que llegan por WebSocket justo cuando el backend crea la partida
        setScore(0);
        setPointData(null);
        setCorrectPoints([]);
        localStorage.setItem("score", JSON.stringify(0));
        localStorage.removeItem("pointData");

        try {
            const response = await axios.post("http://localhost:8090/game/create", userSelected);
            setCurrentGame(response.data);
            localStorage.setItem("currentGame", JSON.stringify(response.data));
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
    // Si hay una partida activa, advertir
    if (gameStarted) {
        const confirmExit = window.confirm(
            "⚠️ Estás en medio de una partida. ¿Seguro que quieres cerrar sesión y perder el progreso?"
        );

        if (!confirmExit) return; // Usuario cancela cierre
    }

    try {
        await axios.post("http://localhost:8090/SessionInfo/logout");

        // Limpiar estado y almacenamiento
        localStorage.removeItem("user");
        localStorage.removeItem("pointData");
        setUserSelected(null);
        setPointData(null);
        setScore(0);
        setGameStarted(false);
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
                <button 
                    onClick={handleEndGame} 
                    disabled={!gameStarted} 
                    style={{
                        height: '40px',
                        marginTop: '10px',
                        backgroundColor: userSelected ? '#da0e07ff' : '#ccc',
                        borderColor: userSelected ? '#da0e07ff' : '#ccc',
                        color: userSelected ? 'white' : '#666',
                        cursor: userSelected ? 'pointer' : 'not-allowed'
                    }}>
                    Terminar Partida
                </button>
            </div>

            <SquareGame
                onClickSend={handleSendClick}
                gameStarted={gameStarted}
                pointData={pointData}
                correctPoints={correctPoints}
            />
        </div>
    );
};

export default ClickPopApp;
