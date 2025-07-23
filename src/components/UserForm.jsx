import { useEffect, useState } from "react";

const initialDataForm = {
    id: 0,
    username: '',
    country: '',
    password: ''
};

export const UserForm = ({ userSelected, handlerAdd, handlerLogin, resetForm }) => {
    const [form, setForm] = useState(initialDataForm);
    const { username, country, password } = form;

    useEffect(() => {
        if (resetForm) {
            setForm(initialDataForm);
        } else if (userSelected) {
            setForm(userSelected);
        }
    }, [userSelected, resetForm]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = (e) => {
        e.preventDefault();
        if (!username || !country || !password) {
            alert('Debe completar todos los campos para registrarse.');
            return;
        }
        handlerAdd(form);
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (!username || !password) {
            alert('Debe ingresar usuario y contraseña para iniciar sesión.');
            return;
        }
        handlerLogin(form);
    };

    return (
        <form
            onSubmit={(e) => e.preventDefault()}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                maxWidth: '300px',
                margin: '0 auto'
            }}
        >
            <input
                placeholder="Nombre de usuario"
                className="form-control"
                name="username"
                value={username}
                onChange={handleChange}
            />
            <input
                type="password"
                placeholder="Contraseña"
                className="form-control"
                name="password"
                value={password}
                onChange={handleChange}
            />
            <input
                placeholder="País (solo para crear)"
                className="form-control"
                name="country"
                value={country}
                onChange={handleChange}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button className="btn btn-primary" onClick={handleRegister}>
                    Crear usuario
                </button>
                <button className="btn btn-secondary" onClick={handleLogin}>
                    Iniciar sesión
                </button>
            </div>
        </form>
    );
};
