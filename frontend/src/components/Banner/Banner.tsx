import React, {ReactElement} from 'react';
import {Link} from 'react-scroll'

const Banner: React.FC = (): ReactElement => {
    return (
        <section className="text-white">
            <div className="div-banner-container">
                <div className="div-banner-text-container">
                    <h1 className="banner-section-title">
                        Wassim Dahmane
                        <span className="sm:block">
                          Développeur full-stack
                        </span>
                    </h1>

                    <p className="banner-introduction-text">
                        Je sais pas encore quoi écrire, laissez moi un peu de temps histoire d'improviser un truc propre
                        et attrayant
                    </p>

                    <div className="div-banner-button-container">
                        <Link to={'who-am-i'} smooth={true} duration={1000} activeClass="active">
                            <button className="banner-bouncing-button">
                                Découvrez-moi !
                            </button>
                        </Link>

                        <a className="banner-button"
                           href="/contact">
                            Contact
                        </a>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Banner;
