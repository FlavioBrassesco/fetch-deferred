import "./styles.css";
import axios from "axios";
import { useEffect, useRef, useState } from "react";

const fetchLoop = async (term, controller) => {
  let { data } = await axios.get("https://pokeapi.co/api/v2/pokemon", {
    signal: controller.signal
  });
  let results = [];
  while (data.next) {
    const temp = data.results.filter((r) => r.name.indexOf(term) >= 0);
    results = results.concat(temp);
    data = (await axios.get(data.next, { signal: controller.signal })).data;
  }
  return results.length > 0 ? results : [{ name: "no results..." }];
};

export default function App() {
  const [pokemon, setPokemon] = useState([]);
  const [showList, setShowList] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const timeoutRef = useRef(null);
  const controllerRef = useRef(new AbortController());

  useEffect(() => {
    if (searchTerm) {
      timeoutRef.current = setTimeout(() => {
        fetchLoop(searchTerm, controllerRef.current)
          .then((pokemon) => {
            setPokemon(pokemon);
          })
          .catch((e) => console.log(e.message));
      }, 500);
    }
  }, [searchTerm]);

  const handleOnChange = async (e) => {
    controllerRef.current.abort();
    controllerRef.current = new AbortController();
    clearTimeout(timeoutRef.current);
    if (e.target.value.length >= 3) {
      setSearchTerm(e.target.value);
      setShowList(true);
    } else {
      setSearchTerm("");
      setShowList(false);
      setPokemon([]);
    }
  };

  return (
    <div className="App">
      <input type="text" placeholder="search..." onChange={handleOnChange} />

      {showList &&
        pokemon.map((p, i) => (
          <div
            key={i}
            style={{ borderBottom: "solid 1px gray", padding: "1rem" }}
          >
            {p.name}
          </div>
        ))}
    </div>
  );
}
