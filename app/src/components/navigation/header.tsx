'use client'
import React, { useContext } from 'react';
import UserContext from '../../contexts/user';
import Health from '../serverPingHealth';

const Header = () => {

    const { user } = useContext(UserContext);

    return (
        <div className="navbar bg-base-200 px-10 p-2 shadow">
        <div className="navbar-start">
            <a href='/' className="btn btn-ghost text-xl">SkattGPT</a>
        </div>
        <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1">
            <a href='/skattegpt' className="btn btn-ghost text-xl">Chat</a>
            </ul>
        </div>
        <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1">
            <a href='/historikk' className="btn btn-ghost text-xl">Historikk</a>
            </ul>
        </div>
        <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1">
            <a href='/feedback' className="btn btn-ghost text-xl">Feedback</a>
            </ul>
        </div>
        <div className="navbar-end">
            <div className='pr-8'>
                <Health/>
            </div>
            <a href='/bruker' className="btn"> {user?.username ? user.username : 'Login' } </a>
        </div>
        </div>
    );
};

export default Header;


