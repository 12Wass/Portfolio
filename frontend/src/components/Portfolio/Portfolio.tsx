import Navigation from "../Navigation/Navigation";
import "../../App.css";
import Banner from "../Banner/Banner";
import AboutMe from "../AboutMe/AboutMe";
import Skills from "../Skills/Skills";

export const Portfolio = () => {
  return (
    <div className="App background-gray">
      <Navigation />
      <Banner />
      <AboutMe />
      <Skills
        context={{
          title: "Expérience professionnelle",
          description:
            "A travers mes différentes expériences professionnelles et mes projets personnels et scolaires, j'ai pu m'ouvrir à de nombreuses façons de progammer mais surtout de penser",
          category: "pro",
        }}
        skills={[
          {
            company: "DGAC - SNA-RP",
            description:
              "Développement d'une application critique permettant de gérer le cycle de travail des contrôleurs aériens de toute la France et des Outre-mers",
            responsibility: "Fullstack Developer",
          },
          {
            company: "Finelia",
            description:
              "Développement d'une application de Trade Finance permettant aux entreprises de gérer leurs transactions financières et leurs garanties via SWIFT",
            responsibility: "Fullstack Developer",
          },
          {
            company: "Teksial",
            description:
              "Participation au développement de plusieurs applications internes de gestion de client dans le contexte des Certificats d'Économie d'Énergie",
            responsibility: "Fullstack Developer",
          },
          {
            company: "October",
            description:
              "Développement transverse sur plusieurs applications utilisées pour du prêt financier hors institution bancaires classiques, du simple dashboard à l'application exploitant une intelligence artificielle permettant de mesurer le risque encouru lors d'un prêt",
            responsibility: "Fullstack Developer",
          },
          {
            company: "See Tickets",
            description:
              "Développement d'un dashboard destiné aux 'Venues' utilisant nos systèmes permettant d'avoir une vue d'ensemble de tous leurs événements ayant eu lieu - Développement d'une application Box-Office destinée aux festivals et aux différents événements faisant de la vente de tickets",
            responsibility: "Fullstack Developer",
          },
        ]}
      />
      <Skills
        context={{
          title: "Parcours scolaire",
          description:
            "Alumni à l'ESGI, j'ai eu l'occasion de réaliser beaucoup de projets très intéressants dans le cadre de mes études mais également pendant mon temps libre",
          category: "school",
        }}
        skills={[
          {
            company: "BonApp",
            description:
              "Création d'une application de gestion de commande et de paiement dans un restaurant via QR Code avec un système complet de gestion d'équipes",
            responsibility: "CEO - Developer",
          },
          {
            company: "Rocket Launcher",
            description:
              "Développement d'une application de mise en relation entre influenceurs et entreprises",
            responsibility: "Project Manager - Developer",
          },
        ]}
      />
    </div>
  );
};

export default Portfolio;
