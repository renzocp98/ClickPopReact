import React from "react";

export const SquareGame = ({ onClickSend }) => {
    const handleClick = (e) => {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        console.log(`🖱️ Click detectado en: x=${x}, y=${y}`);
        onClickSend(x, y); // Llama al método del padre
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <p className="text">Terreno de juego</p>
            <div
                className="square-game"
                onClick={handleClick}
                style={{
                    width: '300px',
                    height: '300px',
                    border: '2px solid black',
                    backgroundColor: '#eee',
                    margin: 'auto',
                    cursor: 'pointer'
                }}
            >
                {/* Aquí irán los puntos más adelante */}
            </div>
        </div>
    );
};
