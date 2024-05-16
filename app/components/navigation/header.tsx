import React from 'react';
import EsHealth from '../esPingHealth';

const Header = () => {
  return (
        <div className="navbar bg-base-200 px-10 p-2 shadow">
        <div className="navbar-start">
            <a href='/' className="btn btn-ghost text-xl">SkattGPT</a>
        </div>
        <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1">
            <a href='/skattegpt' className="btn btn-ghost text-xl">chat</a>
            </ul>
        </div>
        <div className="navbar-end">
            <div className='pr-8'>
                <EsHealth/>
            </div>
            <a className="btn">Login</a>
        </div>
        </div>
  );
};

export default Header;


