'use client'
import React from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Health from '../serverPingHealth';
import { getUserId } from '../../lib/getUserId';

const Header = () => {

    const { data: session } = useSession();

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
            {session ? (
                <button onClick={() => signOut()} className="btn">
                    {session.user?.name || getUserId(session)}
                </button>
            ) : (
                <button onClick={() => signIn('google')} className="btn">Login</button>
            )}
        </div>
        </div>
    );
};

export default Header;


