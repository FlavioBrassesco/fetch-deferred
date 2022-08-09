import "./styles.css";
import axios from "axios";
import { useEffect, useRef, useState } from "react";

const controller = new AbortController();

const fetchLoop = async (term) => {
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
  // timeout id reference for current fetch
  const timeoutRef = useRef(null);

  useEffect(() => {
    controller.abort();
    clearTimeout(timeoutRef.current);
    if (searchTerm) {
      timeoutRef.current = setTimeout(() => {
        fetchLoop(searchTerm)
          .then((pokemon) => {
            setPokemon(pokemon);
            setShowList(true);
          })
          .catch((e) => console.log(e.message));
      }, 500);
    } else {
      setPokemon([]);
      setShowList(false);
    }
  }, [searchTerm]);

  const handleOnChange = async (e) => {
    if (e.target.value.length >= 3) {
      setSearchTerm(e.target.value);
    } else {
      setSearchTerm("");
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
