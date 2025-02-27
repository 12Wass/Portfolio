import React, { ReactElement } from "react";
import { Link, Element } from "react-scroll";

interface Skill {
  company: string;
  description: string;
  responsibility: string;
}

interface SkillsContext {
  title: string;
  description: string;
  category: string;
}

interface Props {
  skills: Skill[];
  context?: SkillsContext;
}

const SkillCard: React.FC<Skill> = ({
  company,
  description,
  responsibility,
}) => (
  <button className="block p-8 transition border border-gray-800 shadow-xl rounded-xl hover:shadow-blue-500/10 hover:border-blue-500/10">
    <div>
      <span className="float-right pt-2 font-extralight">{responsibility}</span>
      <div className="w-10 h-10 text-blue-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M12 14l9-5-9-5-9 5 9 5z" />
          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
          />
        </svg>
      </div>
    </div>
    <h3 className="mt-4 text-xl font-bold text-white">{company}</h3>
    <p className="mt-1 text-sm text-gray-300">{description}</p>
  </button>
);

const Skills: React.FC<Props> = ({ skills, context }): ReactElement => {
  return (
    <section className="text-white bg-gray-900 relative">
      {context?.category === "school" && <Element name="school-things" />}
      <div className="skills-div-container">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">{context?.title}</h2>
          <p className="mt-4 text-gray-300">{context?.description}</p>
        </div>
        <div className={`skills-card-grid lg:grid-cols-${skills.length}`}>
          {skills.map((skill) => (
            <SkillCard key={skill.company} {...skill} />
          ))}
        </div>
        {context?.category === "pro" && (
          <div className="div-banner-button-container">
            <Link
              to="school-things"
              smooth={true}
              duration={1000}
              activeClass="active"
            >
              <button className="school-bouncing-button mt-10">
                D'accord, mais t'as un diplôme ?
              </button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default Skills;
