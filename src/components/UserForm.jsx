import { useEffect, useState } from "react";

const initialDataForm = {
    id: 0,
    username: '',
    country: '',
    password: ''
};

export const UserForm = ({ userSelected, handlerAdd, resetForm }) => {
    const [form, setForm] = useState(initialDataForm);
    const { id, username, country, password } = form;

    // 🔄 Solo actualizar si resetForm es falso
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

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!username || !country || !password) {
            alert('Debe completar todos los campos del formulario!');
            return;
        }

        handlerAdd(form);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <input
                    placeholder="Username"
                    className="form-control my-3 w-75"
                    name="username"
                    value={username}
                    onChange={handleChange}
                />
            </div>
            <div>
                <input
                    placeholder="Country"
                    className="form-control my-3 w-75"
                    name="country"
                    value={country}
                    onChange={handleChange}
                />
            </div>
            <div>
                <input
                    type="password"
                    placeholder="Password"
                    className="form-control my-3 w-75"
                    name="password"
                    value={password}
                    onChange={handleChange}
                />
            </div>
            <button type="submit" className="btn btn-primary">
                {id > 0 ? 'Update' : 'Create'}
            </button>
        </form>
    );
};
