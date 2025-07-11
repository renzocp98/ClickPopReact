import { useEffect, useState } from "react";

const initialDataForm = {
    id: 0,
    username: '',
    country: '',
    password: ''
};

export const UserForm = ({ userSelected, handlerAdd }) => {
    const [form, setForm] = useState(initialDataForm);
    const { id, username, country, password } = form;

    useEffect(() => {
        setForm(userSelected);
    }, [userSelected]);

    return (
        <form onSubmit={(event) => {
            event.preventDefault();
            if (!username || !country || !password) {
                alert('Debe completar todos los campos del formulario!');
                return;
            }

            handlerAdd(form);
            setForm(initialDataForm);
        }}>
            <div>
                <input
                    placeholder="Username"
                    className="form-control my-3 w-75"
                    name="username"
                    value={username}
                    onChange={(event) => setForm({
                        ...form,
                        username: event.target.value
                    })}
                />
            </div>
            <div>
                <input
                    placeholder="Country"
                    className="form-control my-3 w-75"
                    name="country"
                    value={country}
                    onChange={(event) => setForm({
                        ...form,
                        country: event.target.value
                    })}
                />
            </div>
            <div>
                <input
                    type="password"
                    placeholder="Password"
                    className="form-control my-3 w-75"
                    name="password"
                    value={password}
                    onChange={(event) => setForm({
                        ...form,
                        password: event.target.value
                    })}
                />
            </div>
            <button type="submit" className="btn btn-primary">
                {id > 0 ? 'Update' : 'Create'}
            </button>
        </form>
    );
};
