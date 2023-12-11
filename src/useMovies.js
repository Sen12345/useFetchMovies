import { useState, useEffect } from "react";

const KEY = "c9ff98af";

export function useMovies(query, handleCloseMovie) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    function () {
      handleCloseMovie();
      const controller = new AbortController();
      async function fetchData() {
        try {
          setLoading(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?s=${query}&apikey=${KEY}`,
            { signal: controller.signal }
          );
          if (!res.ok)
            throw new Error("Something is wrong with fetching movie");
          const data = await res.json();
          if (data.Response === "False") throw new Error("Movie not found");

          setMovies(data.Search);
          setError("");
        } catch (err) {
          if (err.name !== "AbortError") {
            setError(err.message);
          }
        } finally {
          setLoading(false);
        }
      }

      if (!query.length) {
        setMovies([]);
        setError("");
        setLoading(false);
        return;
      }
      handleCloseMovie();
      fetchData();
      return function () {
        controller.abort();
      };
    },
    [query]
  );
  return { movies, loading, error };
}
