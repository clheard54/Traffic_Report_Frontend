import React from 'react'
import '../assets/bootstrap.css'


export default class NavBar extends React.Component{
    render(){
        return (
            <nav className="navbar navbar-light bg-light">
            <h3 className="navbar-brand">Traffic Controller</h3>
            <div className="navbar-expand" id="navbarNavDropdown">
                <ul className="navbar-nav">
                <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Course List
                    {/* RENDER DYNAMICALLY BY QUERYING BACKEND? */}
                    </a>
                    <div className="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                    <a className="dropdown-item" href="#">Geometry</a>
                    <a className="dropdown-item" href="www.google.com">Algebra II</a>
                    <a className="dropdown-item" href="www.google.com">PreCalculus</a>
                    </div>
                </li>
                <li className="nav-item active">
                    <a className="nav-link" href="www.google.com">School Website <span className="sr-only">(current)</span></a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="www.google.com">Home</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="www.google.com">Logout</a>
                </li>
                </ul>
            </div>
            </nav>
        )
    }
}



