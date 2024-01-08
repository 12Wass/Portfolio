import React, { ReactElement } from "react";
import { Element } from "react-scroll";
import Separator from "../Separator/Separator";
import "./AboutMe.css";

const AboutMe: React.FC = (): ReactElement => {
  return (
    <Element name="who-am-i">
      <div className="max-w-5xl px-4 mx-auto lg:h-max">
        <section className="p-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-3 sm:items-center">
            <div className="relative">
              <div className="aspect-w-1 aspect-h-1">
                <img
                  src="https://media.licdn.com/dms/image/D4E03AQE0Z2YJIOPATg/profile-displayphoto-shrink_200_200/0/1674605711336?e=1710374400&v=beta&t=Xo1wDPeHzwiLZ5akh0QGIqj7Sv_tlOInE6XnPV8clIE"
                  alt=""
                  className="object-cover rounded-lg"
                />
              </div>

              <div className="absolute inline-flex px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-xl -bottom-4 -right-4">
                <span className="inline-block bg-transparent rounded-lg">
                  <a className="ml-2 mr-2" href="#here">
                    Télécharger mon CV
                  </a>
                </span>
              </div>
            </div>

            <blockquote className="sm:col-span-2">
              <p className="text-xl font-medium sm:text-2xl">
                Passionné et très curieux. J'essaie d'atteindre les limites de
                stockage de mon cerveau pour voir.
              </p>

              <cite className="inline-flex items-center mt-8 not-italic">
                <span className="hidden w-6 h-px bg-gray-400 sm:inline-block" />
                <p className="text-sm text-gray-500 uppercase sm:ml-3">
                  <strong>Wassim Dahmane</strong>, &#123;&#123; Votre entreprise
                  &#125;&#125;.
                </p>
              </cite>
            </blockquote>
          </div>
        </section>

        <Separator />
      </div>
    </Element>
  );
};

export default AboutMe;
