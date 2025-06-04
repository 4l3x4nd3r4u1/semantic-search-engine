import { NextResponse } from 'next/server';
import { RdfXmlParser } from 'rdfxml-streaming-parser';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import fetch from 'node-fetch';

const classTranslationMap = {
  'Articulo': 'Article',
  'Libro': 'Book',
  'Video': 'Video',
  'Audio': 'Audio',
};

export async function GET() {
  try {
    const ontologyPath = path.join(process.cwd(), 'public', 'RecursosEducativos.rdf');
    const fileStream = fs.createReadStream(ontologyPath);
    const readable = new Readable().wrap(fileStream);

    const instancesMap = new Map();
    const classHierarchy = {};
    const individualTypes = new Map();

    const parser = new RdfXmlParser();

    return new Promise((resolve) => {
      parser.on('data', (quad) => {
        const subject = quad.subject.value;
        const predicate = quad.predicate.value;
        const object = quad.object.value;

        // Capturar jerarquía de clases
        if (predicate === 'http://www.w3.org/2000/01/rdf-schema#subClassOf') {
          const className = extractLocalName(subject);
          const parentClass = extractLocalName(object);

          if (!classHierarchy[className]) {
            classHierarchy[className] = [];
          }
          classHierarchy[className].push(parentClass);
        }

        // Registrar tipos de individuos
        if (predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
          const individual = subject;
          const type = extractLocalName(object);

          if (!individualTypes.has(individual)) {
            individualTypes.set(individual, new Set());
          }
          individualTypes.get(individual).add(type);

          // Inicializar la instancia si no existe
          if (!instancesMap.has(individual)) {
            instancesMap.set(individual, {
              id: individual,
              properties: {},
            });
          }
        }

        // Capturar propiedades de instancias
        if (
          !predicate.includes('type') &&
          !predicate.includes('Property') &&
          (subject.includes('#') || subject.includes('/')) &&
          !subject.endsWith('untitled-ontology-30')
        ) {
          const propertyName = extractLocalName(predicate);
          const propertyValue = quad.object.termType === 'Literal' ? quad.object.value : quad.object.value;

          let instance = instancesMap.get(subject);
          if (!instance) {
            instance = {
              id: subject,
              properties: {},
            };
            instancesMap.set(subject, instance);
          }

          instance.properties[propertyName] = propertyValue;
        }
      });

      parser.on('error', (error) => {
        resolve(
          NextResponse.json({ error: 'Error parsing RDF', details: error.message }, { status: 500 })
        );
      });

      parser.on('end', async () => {
        const determineClass = (individualId) => {
          const types = Array.from(individualTypes.get(individualId) || []);
          const targetClasses = Object.keys(classTranslationMap);

          // Buscar coincidencia directa
          for (const type of types) {
            if (targetClasses.includes(type)) {
              return classTranslationMap[type];
            }
          }

          // Buscar en la jerarquía de clases
          let bestMatch = null;
          let longestPath = -1;

          for (const type of types) {
            const queue = [{ className: type, depth: 0 }];
            const visited = new Set();

            while (queue.length > 0) {
              const { className, depth } = queue.shift();
              visited.add(className);

              if (targetClasses.includes(className)) {
                if (depth > longestPath) {
                  longestPath = depth;
                  bestMatch = className;
                }
              }

              if (classHierarchy[className]) {
                for (const parent of classHierarchy[className]) {
                  if (!visited.has(parent)) {
                    queue.push({ className: parent, depth: depth + 1 });
                  }
                }
              }
            }
          }

          return bestMatch ? classTranslationMap[bestMatch] : null;
        };

        // Procesar instancias
        const instancesArray = Array.from(instancesMap.values());

        const enrichedInstances = await Promise.all(
          instancesArray.map(async (instance) => {
            const instanceClass = determineClass(instance.id);
            if (!instanceClass) return null;

            const enrichedInstance = {
              id: instance.id,
              class: instanceClass,
              ...instance.properties,
            };

            // Enriquecer con DBpedia si hay autor
            if (enrichedInstance.autor) {
              const dbpediaData = await fetchDBpediaData(enrichedInstance.autor);
              if (dbpediaData) {
                enrichedInstance.dbpedia = dbpediaData;
              }
            }

            return enrichedInstance;
          })
        );

        const finalEnrichedInstances = enrichedInstances.filter(Boolean);

        resolve(
          NextResponse.json({
            success: true,
            instances: finalEnrichedInstances,
          })
        );
      });

      readable.pipe(parser);
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}

// Extrae el nombre local de una URI
function extractLocalName(uri) {
  const fragment = uri.split('#').pop();
  if (fragment && fragment !== uri) return fragment;

  const segments = uri.split('/').filter(Boolean);
  return segments.pop() || uri;
}

// Obtiene datos de DBpedia para un autor
async function fetchDBpediaData(entity) {
  const endpoint = 'https://dbpedia.org/sparql';
  const query = `
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX dbo: <http://dbpedia.org/ontology/>
    SELECT ?abstract WHERE {
      ?person rdfs:label "${entity}"@en .
      OPTIONAL { ?person dbo:abstract ?abstract . }
      FILTER (lang(?abstract) = 'en' || !bound(?abstract))
    } LIMIT 1
  `;
  const url = `${endpoint}?query=${encodeURIComponent(query)}&format=json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`DBpedia API returned status: ${response.status}`);
      return null;
    }
    const data = await response.json();
    if (data.results.bindings.length > 0 && data.results.bindings[0].abstract) {
      return data.results.bindings[0].abstract.value;
    }
  } catch (error) {
    console.error(`Error fetching data from DBpedia for ${entity}:`, error);
  }

  return null;
}
