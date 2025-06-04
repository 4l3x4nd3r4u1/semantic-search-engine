import FolderIcon from "./FolderIcon";
import { useState, useEffect } from "react";

export default function EnglishContent({ englishResources }) {
  const [resources, setResources] = useState(englishResources);
  const [filters, setFilters] = useState({
    type: null,
    educationalLevel: null,
    discipline: null
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const filtered = englishResources.filter(resource => {
      const typeMatch = !filters.type || resource.class === filters.type;
      const levelMatch = !filters.educationalLevel || resource.nivelEducativo === filters.educationalLevel;
      const disciplineMatch = !searchTerm ||
        resource.disciplina.toLowerCase().includes(searchTerm.toLowerCase());

      return typeMatch && levelMatch && disciplineMatch;
    });
    setResources(filtered);
  }, [filters, searchTerm, englishResources]);

  const handleFilterClick = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType] === value ? null : value
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: null,
      educationalLevel: null,
      discipline: null
    });
    setSearchTerm("");
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div>
      <form>
        <input
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="E.g. Programming"
          className="outline-none text-8xl tracking-tighter border-b pb-2 w-full"
          autoFocus
        />
      </form>

      <div className="grid grid-cols-[repeat(24,_1fr)] mt-14">
        <h2 className="col-span-full text-7xl tracking-tighter mb-8 flex">
          Feed <sup className="text-4xl tracking-tight">({resources.length})</sup>
        </h2>
        <div className="lg:col-span-6 col-span-full  grid grid-cols-subgrid h-fit">
          <div className="col-span-full grid grid-cols-subgrid text-xs mb-2 border-b pb-2">
            <span className="col-span-2">/ FILTER</span>
            <button
              onClick={clearFilters}
              disabled={!filters.type && !filters.educationalLevel && !searchTerm}
              className="col-start-5 col-span-full text-end cursor-pointer"
            >
              CLEAR FILTERS
            </button>
          </div>

          <div className="lg:col-span-3 lg:mt-2 col-span-full grid grid-cols-[repeat(3,_1fr)] lg:block">
            <div className="flex gap-x-[8px] items-center text-sm">
              <FolderIcon />
              <span>Type</span>
            </div>
            <ul className="text-sm lg:border-l lg:border-dotted lg:pl-4 lg:ml-2 lg:mt-1 lg:block flex gap-x-6">
              {['Book', 'Article', 'Video', 'Audio'].map(type => (
                <li
                  key={type}
                  className={`w-fit leading-[115%] cursor-pointer ${filters.type === type ? 'bg-[#bfef75]' : ''}`}
                  onClick={() => handleFilterClick('type', type)}
                >
                  {type}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3 lg:mt-2 col-span-full grid grid-cols-[repeat(3,_1fr)] lg:block">
            <div className="flex gap-x-[8px] items-center text-sm">
              <FolderIcon />
              <span>Educational Level</span>
            </div>
            <ul className="text-sm lg:border-l lg:border-dotted lg:pl-4 lg:ml-2 lg:mt-1 lg:block flex gap-x-6">
              {['University', 'High School', 'Postgraduate'].map(level => (
                <li
                  key={level}
                  className={`cursor-pointer w-fit leading-[115%] ${filters.educationalLevel === level ? 'bg-[#75d1f1]' : ''}`}
                  onClick={() => handleFilterClick('educationalLevel', level)}
                >
                  {level}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-start-8 col-span-full grid grid-cols-subgrid h-fit mt-12">
          <div className="col-span-full grid grid-cols-subgrid text-xs border-b pb-2">
            <span className="col-span-2">/ DATE</span>
            <span className="col-span-2 col-start-4 lg:col-start-3">/ NAME</span>
            <span className="lg:col-start-15 col-start-19">/ TYPE</span>
          </div>

          {resources.map(resource => (
            <Resource
              key={resource.id}
              resource={resource}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Resource({ resource }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="col-span-full grid grid-cols-subgrid border-b py-1" key={resource.id}>
      <div
        className="col-span-full grid grid-cols-subgrid items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="text-xs col-span-2 flex items-center gap-x-1">
          <span className="w-2 h-2 bg-[#1e1e1e]" />
          {resource.fechaDePublicacion}
        </div>
        <div
          className="col-start-4 lg:col-start-3 lg:col-span-11 col-span-14  truncate text-[calc(20px_+_((28_-_22)_*_(100vw_-_960px)_/_(1728_-_960)))] tracking-tight"
        >
          {resource.titulo}
        </div>
        <div
          className="text-xs lg:col-start-15 col-start-19 col-span-full uppercase border border-dotted border-[#1e1e1e95] w-fit px-0.5 rounded"
        >
          {resource.class}
        </div>
      </div>

      {isOpen && (
        <ResourceDetails resource={resource} />
      )}
    </div>
  )
}

function ResourceDetails({ resource }) {
  const commonDetails = (
    <>
      {resource.dbpedia && (
        <div className="col-span-full mt-2">
          <span className="font-bold">DBpedia:</span> {resource.dbpedia}
        </div>
      )}
      <div><span className="font-bold">Author:</span> {resource.autor}</div>
      <div><span className="font-bold">Discipline:</span> {resource.disciplina}</div>
      <div><span className="font-bold">Format:</span> {resource.formato}</div>
      <div><span className="font-bold">Language:</span> {resource.idioma}</div>
      <div><span className="font-bold">License:</span> {resource.licencia}</div>
      <div><span className="font-bold">Medium:</span> {resource.medio}</div>
      <div><span className="font-bold">Educational Level:</span> {resource.nivelEducativo}</div>
      {resource.url &&
        <div>
          <span className="font-bold">URL:</span>
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {resource.url}
          </a>
        </div>
      }
    </>
  );

  switch (resource.class) {
    case "Article":
      return (
        <div className="col-span-full text-sm pb-4">
          {commonDetails}
          <div><span className="font-bold">Character Encoding:</span> {resource.codificacionDeCaracteres}</div>
          <div><span className="font-bold">Source:</span> {resource.fuente}</div>
          <div><span className="font-bold">Place of publication:</span> {resource.lugarDePublicacion}</div>
          <div><span className="font-bold">Number of pages:</span> {resource.numeroPaginas}</div>
        </div>
      );
    case "Audio":
      return (
        <div className="col-span-full text-sm pb-4">
          {commonDetails}
          <div><span className="font-bold">Quality:</span> {resource.calidad}</div>
          <div><span className="font-bold">Category:</span> {resource.categoria}</div>
          <div><span className="font-bold">Duration:</span> {resource.duracion}</div>
          {resource.transcripcion &&
            <div>
              <span className="font-bold">
                Transcription:</span> {resource.transcripcion === "true" ? "Yes" : "No"}
            </div>
          }
        </div>
      );
    case "Book":
      return (
        <div className="col-span-full text-sm pb-4">
          {commonDetails}
          <div><span className="font-bold">Character Encoding:</span> {resource.codificacionDeCaracteres}</div>
          <div><span className="font-bold">Edition:</span> {resource.edicion}</div>
          <div><span className="font-bold">Editorial:</span> {resource.editorial}</div>
          <div><span className="font-bold">Identifier:</span> {resource.identificador}</div>
          <div><span className="font-bold">Number of pages:</span> {resource.numeroPaginas}</div>
        </div>
      );
    case "Video":
      return (
        <div className="col-span-full text-sm pb-4">
          {commonDetails}
          <div><span className="font-bold">Quality:</span> {resource.calidad}</div>
          <div><span className="font-bold">Duration:</span> {resource.duracion}</div>
          <div><span className="font-bold">Resolution:</span> {resource.resolucion}</div>
          {resource.subtitulos &&
            <div>
              <span className="font-bold">Subtitles:</span>
              {resource.subtitulos === "true" ? "Yes" : "No"}
            </div>
          }
          {resource.transcripcion &&
            <div>
              <span className="font-bold">Transcription:</span>
              {resource.transcripcion === "true" ? "Yes" : "No"}
            </div>
          }
        </div>
      );
    default:
      return (
        <div className="col-span-full text-sm pb-4">
          {commonDetails}
          <p>No hay detalles específicos disponibles para este tipo de recurso.</p>
        </div>
      );
  }
}
