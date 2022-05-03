import React from 'react';
import Navigation from "./components/Navigation/Navigation";
import './App.css';
import Banner from "./components/Banner/Banner";
import AboutMe from "./components/AboutMe/AboutMe";

function App() {
    return (
        <div className="App background-gray">
            <Navigation/>
            <Banner/>
            <AboutMe/>
        </div>
    );
}

export default App;
