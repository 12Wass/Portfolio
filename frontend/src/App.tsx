import React from 'react';
import Navigation from "./components/Navigation/Navigation";
import './App.css';
import Banner from "./components/Banner/Banner";
import AboutMe from "./components/AboutMe/AboutMe";
import Skills from "./components/Skills/Skills";
import Separator from './components/Separator/Separator';

function App() {
    return (
        <div className="App background-gray">
            <Navigation/>
            <Banner/>
            <AboutMe/>
            <Skills
                context={
                    {
                        title: "Expérience professionnelle",
                        description: "A travers mes différentes expériences professionnelles et mes projets personnels et scolaires, j'ai pu m'ouvrir à de nombreuses façons de progammer mais surtout de penser"
                    }
                }
                skills={[
                    {
                        enterprise: "DGAC - SNA-RP",
                        description: "Développement d'une application critique permettant de gérer le cycle de travail des contrôleurs aériens de toute la France et des Outre-mers",
                        responsibility: "Fullstack Developer"
                    },
                    {
                        enterprise: "Finelia",
                        description: "Développement d'une application de Trade Finance permettant aux entreprises de gérer leurs transactions financières et leurs garanties via SWIFT",
                        responsibility: "Fullstack Developer"
                    },
                    {
                        enterprise: "Teksial",
                        description: "Participation au développement de plusieurs applications internes de gestion de client dans le contexte des Certificats d'Économie d'Énergie",
                        responsibility: "Fullstack Developer"
                    }
                ]}
            />
            <Skills
                context={
                    {
                        title: "Parcours scolaire",
                        description: "Alumni à l'ESGI, j'ai eu l'occasion de réaliser beaucoup de projets très intéressants dans le cadre de mes études mais également pendant mon temps libre"
                    }
                }
                skills={[
                    {
                        enterprise: "BonApp",
                        description: "Création d'une application de gestion de commande et de paiement dans un restaurant via QR Code avec un système complet de gestion d'équipes",
                        responsibility: "CEO - Developer"
                    },
                    {
                        enterprise: "Rocket Launcher",
                        description: "Développement d'une application de mise en relation entre influenceurs et entreprises",
                        responsibility: "Project Manager - Developer"
                    },
                ]}
            />
        </div>
    );
}

export default App;
