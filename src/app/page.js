'use client'

import { useState, useEffect } from "react";
import SpanishContent from "./ui/SpanishContent";
import EnglishContent from "./ui/EnglishContent";
import PortugueseContent from "./ui/PortugueseContent";

async function getRecursos() {
  const res = await fetch('http://localhost:3000/api/test');

  if (!res.ok)
    throw new Error(`Failed to fetch resources: ${res.status} ${res.statusText}`);

  return res.json();
}

export default function Home() {
  const [language, setLanguage] = useState("Español");
  const [englishResources, setEnglishResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await getRecursos();
        if (data.success) {
          setEnglishResources(data.instances);
        } else {
          setError('No se pudieron obtener los recursos.');
        }
      } catch (err) {
        console.error("Error al cargar los recursos:", err);
        setError('Error al cargar los recursos. Por favor, inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Cargando Recursos...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  return (
    <main className="p-4">
      <ul className="text-sm flex gap-x-4">
        {['Español', 'English', 'Português'].map(item => (
          <li
            className={`${item === language ? "bg-[#f0b976]" : ""} leading-[100%] cursor-pointer`}
            key={item}
            onClick={() => setLanguage(item)}
          >
            {item}
          </li>
        ))}
      </ul>
      {language === "Español" ? (
        <SpanishContent />
      ) : language === "English" ? (
        <EnglishContent
          englishResources={englishResources}
        />
      ) : (
        <PortugueseContent />
      )}
    </main>
  )
}
