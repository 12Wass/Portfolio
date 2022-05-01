import React from 'react';

const Banner = () => {
    return (
        <section className="text-white bg-gray-900">
            <div className="max-w-screen-xl px-4 py-32 mx-auto lg:h-screen lg:items-center lg:flex">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-3xl font-extrabold text-transparent sm:text-5xl bg-clip-text bg-gradient-to-r from-green-300 via-blue-500 to-purple-600">
                        Wassim Dahmane
                        <span className="sm:block">
                          Développeur full-stack
                        </span>
                    </h1>

                    <p className="max-w-xl mx-auto mt-4 sm:leading-relaxed sm:text-xl">
                        Je sais pas encore quoi écrire, laissez moi un peu de temps histoire d'improviser un truc propre et attrayant
                    </p>

                    <div className="flex flex-wrap justify-center gap-4 mt-8">
                        <a className="block w-full px-12 py-3 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded sm:w-auto active:text-opacity-75 hover:bg-transparent hover:text-white focus:outline-none focus:ring"
                           href="/discover-me">
                            Découvrez-moi !
                        </a>

                        <a className="block w-full px-12 py-3 text-sm font-medium text-white border border-blue-600 rounded sm:w-auto hover:bg-blue-600 active:bg-blue-500 focus:outline-none focus:ring"
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


/*
$nodeList = [1, 7, 3, 4, 2, 6, 9];
$nodeLinks = [3, 3, 4, 6, 6, 9, 5];
 */