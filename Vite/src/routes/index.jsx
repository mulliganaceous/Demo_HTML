import { useState } from 'react'
import { useLoaderData } from "react-router-dom";
import reactLogo from '/src/assets/react.svg'
import viteLogo from '/vite.svg'
import { getCount, increment, getUser } from '../demoauth.js'

export async function loader() {
    let count = getCount();
    let user = await getUser();
    return { count: count.count, user: user.user };
}

export default function Index() {
    const loaderdata = useLoaderData();
    const [count, setCount] = useState(loaderdata.count);
    const user = loaderdata.user;
    return (
        <div>
            <div>
                <a href="https://vitejs.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>
            <h1>Vite + React</h1>
            <div className="card">
                <button onClick={() => {increment(); setCount(getCount().count)}}>
                    count is {count}
                </button>
                <p>
                    Edit <code>src/App.jsx</code> and save to test HMR
                </p>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more, {user ? user : <i>guest</i>}!
            </p>
        </div>
    );
}