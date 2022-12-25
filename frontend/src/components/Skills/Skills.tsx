import React, {ReactElement, useState} from 'react';
import Modal from "../Modal/Modal";


interface Props {
    skills: {
        enterprise: string,
        description: string,
        modalDetails: string, // CHANGE THIS TO JSON OBJECT (IMAGES AND ALL OF THAT)
    }[];
}

const Skills: React.FC<Props> = (skills: Props): ReactElement => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState();

    const toggleModal = (data: any) => {
        setModalData(data);
        if (isModalOpen === false) {
            setIsModalOpen(!isModalOpen);
        }
    }


    return (
        <section className="text-white bg-gray-900 relative">
            <div className="skills-div-container">
                <div className="max-w-lg mx-auto text-center">
                    <h2 className="text-3xl font-bold sm:text-4xl">Expérience professionnelle</h2>

                    <p className="mt-4 text-gray-300">
                        A travers mes différentes expériences professionnelles et mes projets personnels et scolaires,
                        j'ai pu m'ouvrir à de nombreuses façons de programmer mais surtout de penser.
                    </p>
                </div>

                <Modal canShow={isModalOpen} updateModalState={toggleModal} data={modalData} />

                <div className="skills-card-grid">
                    {skills.skills.map(skill => {
                        return (
                            <button
                                className="block p-8 transition border border-gray-800 shadow-xl rounded-xl hover:shadow-blue-500/10 hover:border-blue-500/10"
                                onClick={() => toggleModal(skill.description)}
                                key={skill.enterprise}
                            >
                            <div className="w-10 h-10 text-blue-500">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                                    <path
                                        d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                                    />
                                </svg>
                            </div>

                                <h3 className="mt-4 text-xl font-bold text-white">{skill.enterprise}</h3>

                                <p className="mt-1 text-sm text-gray-300">
                                    {skill.description}
                                </p>
                            </button>
                        )
                    })}
                </div>
            </div>
        </section>
    );
}

export default Skills;