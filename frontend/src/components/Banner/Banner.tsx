import React from 'react';

const Banner = () => {
    return (
        <section className="section-banner-container">
            <div className="div-banner-container">
                <div className="div-banner-text-container">
                    <h1 className="section-title">
                        Wassim Dahmane
                        <span className="sm:block">
                          Développeur full-stack
                        </span>
                    </h1>

                    <p className="banner-introduction-text">
                        Je sais pas encore quoi écrire, laissez moi un peu de temps histoire d'improviser un truc propre et attrayant
                    </p>

                    <div className="div-banner-button-container">
                        <a className="banner-bouncing-button"
                           href="/discover-me">
                            Découvrez-moi !
                        </a>

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
