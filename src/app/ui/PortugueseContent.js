import { portugueseResources } from "../lib/portuguese-translated-instances";
import { useState, useEffect } from "react";
import FolderIcon from "./FolderIcon";

export default function PortugeseContent() {
  const [resources, setResources] = useState(portugueseResources);
  const [filters, setFilters] = useState({
    tipo: null,
    nivelEducativo: null,
    disciplina: null
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const filtered = portugueseResources.filter(resource => {
      const tipoMatch = !filters.tipo || resource.class === filters.tipo;
      const nivelMatch = !filters.nivelEducativo || resource.nivelEducativo === filters.nivelEducativo;

      const disciplinaMatch = !searchTerm ||
        resource.disciplina.toLowerCase().includes(searchTerm.toLowerCase());

      return tipoMatch && nivelMatch && disciplinaMatch;
    });
    setResources(filtered);
  }, [filters, searchTerm]);

  const handleFilterClick = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType] === value ? null : value
    }));
  };

  const clearFilters = () => {
    setFilters({
      tipo: null,
      nivelEducativo: null,
      disciplina: null
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
          placeholder="Em. Programação"
          value={searchTerm}
          onChange={handleSearchChange}
          className="outline-none text-8xl tracking-tighter border-b pb-2 w-full"
          autoFocus
        />
      </form>

      <div className="grid grid-cols-[repeat(24,_1fr)] mt-14">
        <h2 className="col-span-full text-7xl tracking-tighter mb-8 flex">
          Fluxo <sup className="text-4xl tracking-tight">({resources.length})</sup>
        </h2>
        <div className="lg:col-span-6 col-span-full  grid grid-cols-subgrid h-fit">
          <div className="col-span-full grid grid-cols-subgrid text-xs mb-2 border-b pb-2">
            <span className="col-span-2">/ FILTRO</span>
            <button
              className="col-start-5 col-span-full text-end cursor-pointer"
              onClick={clearFilters}
              disabled={!filters.tipo && !filters.nivelEducativo && !searchTerm}
            >
              LIMPAR FILTROS
            </button>
          </div>

          <div className="lg:col-span-3 lg:mt-2 col-span-full grid grid-cols-[repeat(3,_1fr)] lg:block">
            <div className="flex gap-x-[8px] items-center text-sm">
              <FolderIcon />
              <span>Tipo</span>
            </div>
            <ul className="text-sm lg:border-l lg:border-dotted lg:pl-4 lg:ml-2 lg:mt-1 lg:block flex gap-x-6">
              {['Livro', 'Artigo', 'Vídeo', 'Áudio'].map(tipo => (
                <li
                  key={tipo}
                  className={`w-fit leading-[115%] cursor-pointer ${filters.tipo === tipo ? 'bg-[#bfef75]' : ''}`}
                  onClick={() => handleFilterClick('tipo', tipo)}
                >
                  {tipo}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3 lg:mt-2 col-span-full grid grid-cols-[repeat(3,_1fr)] lg:block">
            <div className="flex gap-x-[8px] items-center text-sm">
              <FolderIcon />
              <span>Nivel Educativo</span>
            </div>
            <ul className="text-sm lg:border-l lg:border-dotted lg:pl-4 lg:ml-2 lg:mt-1 lg:block flex gap-x-6">
              {['Universitário', 'Secundário', 'Pós-graduação'].map(nivel => (
                <li
                  key={nivel}
                  className={`cursor-pointer w-fit leading-[115%] ${filters.nivelEducativo === nivel ? 'bg-[#75d1f1]' : ''}`}
                  onClick={() => handleFilterClick('nivelEducativo', nivel)}
                >
                  {nivel}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-start-8 col-span-full grid grid-cols-subgrid h-fit mt-12">
          <div className="col-span-full grid grid-cols-subgrid text-xs border-b pb-2">
            <span className="col-span-2">/ DATA</span>
            <span className="col-span-2 col-start-4 lg:col-start-3">/ NOME</span>
            <span className="lg:col-start-15 col-start-19">/ TIPO</span>
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
      <div><span className="font-bold">Autor:</span> {resource.autor}</div>
      <div><span className="font-bold">Disciplina:</span> {resource.disciplina}</div>
      <div><span className="font-bold">Linguagem:</span> {resource.idioma}</div>
      <div><span className="font-bold">Licença:</span> {resource.licencia}</div>
      <div><span className="font-bold">Meio:</span> {resource.medio}</div>
      <div><span className="font-bold">Nível Educacional:</span> {resource.nivelEducativo}</div>
      <div><span className="font-bold">Formato:</span> {resource.formato}</div>
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
    case "Artigio":
      return (
        <div className="col-span-full text-sm pb-4">
          {commonDetails}
          <div><span className="font-bold">Codificação de Caracteres:</span> {resource.codificacionDeCaracteres}</div>
          <div><span className="font-bold">Fonte:</span> {resource.fuente}</div>
          <div><span className="font-bold">Local de publicação:</span> {resource.lugarDePublicacion}</div>
          <div><span className="font-bold">Número de Páginas:</span> {resource.numeroPaginas}</div>
        </div>
      );
    case "Áudio":
      return (
        <div className="col-span-full text-sm pb-4">
          {commonDetails}
          <div><span className="font-bold">Qualidade:</span> {resource.calidad}</div>
          <div><span className="font-bold">Categoría:</span> {resource.categoria}</div>
          <div><span className="font-bold">Duração:</span> {resource.duracion}</div>
          {resource.transcripcion && <div><span className="font-bold">Transcripción:</span> {resource.transcripcion === "true" ? "Sím" : "Não"}</div>}
        </div>
      );
    case "Livro":
      return (
        <div className="col-span-full text-sm pb-4">
          {commonDetails}
          <div><span className="font-bold">Codificação de Caracteres:</span> {resource.codificacionDeCaracteres}</div>
          <div><span className="font-bold">Edição:</span> {resource.edicion}</div>
          <div><span className="font-bold">Editora:</span> {resource.editorial}</div>
          <div><span className="font-bold">Identificador:</span> {resource.identificador}</div>
          <div><span className="font-bold">Número de Páginas:</span> {resource.numeroPaginas}</div>
        </div>
      );
    case "Vídeo":
      return (
        <div className="col-span-full text-sm pb-4">
          {commonDetails}
          <div><span className="font-bold">Qualidade:</span> {resource.calidad}</div>
          <div><span className="font-bold">Duração:</span> {resource.duracion}</div>
          <div><span className="font-bold">Resolução:</span> {resource.resolucion}</div>
          {resource.subtitulos && <div><span className="font-bold">Subtítulos:</span> {resource.subtitulos === "true" ? "Sí" : "No"}</div>}
          {resource.transcripcion && <div><span className="font-bold">Transcripción:</span> {resource.transcripcion === "true" ? "Sí" : "No"}</div>}
        </div>
      );
    default:
      return (
        <div className="col-span-full text-sm pb-4">
          {commonDetails}
          <p>Não há detalhes específicos disponíveis para este tipo de recurso.</p>
        </div>
      );
  }
}
