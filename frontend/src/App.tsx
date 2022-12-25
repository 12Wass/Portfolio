import React from 'react';
import Navigation from "./components/Navigation/Navigation";
import './App.css';
import Banner from "./components/Banner/Banner";
import AboutMe from "./components/AboutMe/AboutMe";
import Skills from "./components/Skills/Skills";

function App() {
    return (
        <div className="App background-gray">
            <Navigation/>
            <Banner/>
            <AboutMe/>
            <Skills
                skills={[
                    {
                        enterprise: "DGAC - SNA-RP",
                        description: "Développement d'une application critique permettant de gérer le cycle de travail des contrôleurs aériens de toute la France et des Outre-mers",
                        modalDetails: "Modal details"
                    },
                    {
                        enterprise: "Finelia",
                        description: "Développement d'une application de Trade Finance permettant aux entreprises de gérer leurs transactions financières via SWIFT",
                        modalDetails: "Modal details"
                    },
                    {
                        enterprise: "Teksial",
                        description: "Participation au développement de plusieurs applications internes de gestion de client et de front-office",
                        modalDetails: "Modal details"
                    }
                ]}
            />
        </div>
    );
}

export default App;
