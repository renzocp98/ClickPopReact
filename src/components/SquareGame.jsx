import React, { useEffect, useRef } from "react";

export const SquareGame = ({ onClickSend, gameStarted, pointData }) => {
    const canvasRef = useRef(null);

    const handleClick = (e) => {
        if (!gameStarted) {
            alert("Primero debes iniciar una partida.");
            return;
        }

        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        onClickSend(x, y);
    };

    useEffect(() => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");

            if (pointData?.points) {
                ctx.clearRect(0, 0, 300, 300);
                pointData.points.forEach(([x, y]) => {
                ctx.beginPath();  
                ctx.arc(x, y, 8, 0, 2 * Math.PI);  
                ctx.fillStyle = "red";
                ctx.fill();  
});

            }

        }
    }, [pointData]);

    return (
        <div style={{ textAlign: 'center', position: 'relative', marginTop: '20px' }}>
            <p className="text">Terreno de juego</p>
            <canvas
                ref={canvasRef}
                width={300}
                height={300}
                onClick={handleClick}
                style={{
                    border: '2px solid black',
                    backgroundColor: gameStarted ? '#eee' : '#ccc',
                    cursor: gameStarted ? 'pointer' : 'not-allowed',
                    opacity: gameStarted ? 1 : 0.5
                }}
            />
            {!gameStarted && (
                <div
                    style={{
                        position: 'absolute',
                        top: '65%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: 'red',
                        fontWeight: 'bold',
                        pointerEvents: 'none'
                    }}
                >
                    Inicia una partida
                </div>
            )}
        </div>
    );
};
