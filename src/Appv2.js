import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating1";
import { useMovies } from "./useMovies";
import { useLocalStorage } from "./useLocalStorage";

const KEY = "c9ff98af";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function Appv2() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const { movies, loading, error } = useMovies(query, handleCloseMovie);

  const [watched, setWatched] = useLocalStorage([]);

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
    // localStorage.clear();
    // localStorage.setItem("watched", JSON.stringify([...watched, movie]));
  }

  function handleSelectedId(id) {
    setSelectedId((selectedId) => (selectedId === id ? null : id));
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleDeleteWatchedMovie(id) {
    setWatched((watched) => watched.filter((watch) => watch.imdbID !== id));
  }

  return (
    <>
      <Navbar>
        <Search query={query} setQuery={setQuery} />
        <SearchResults movies={movies} />
      </Navbar>

      <Main movies={movies}>
        <Box movies={movies}>
          {loading && <Loading />}
          {!loading && !error && (
            <MovieList onSelectMovie={handleSelectedId} movies={movies} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box movies={movies}>
          {selectedId ? (
            <MoviesDetails
              onHandleCloseMovie={handleCloseMovie}
              selectedId={selectedId}
              onHandleAddWached={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchSummary watched={watched} />
              <WatchList
                watched={watched}
                onDeleteWatchedMovie={handleDeleteWatchedMovie}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function ErrorMessage({ message }) {
  return <p>⛔️{message}</p>;
}

function Navbar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>useFetchMovies</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const search = useRef(null);

  useEffect(
    function () {
      function callback(e) {
        if (document.activeElement === search.current) return;
        if (e.code === "Enter") {
          search.current.focus();
        }
      }

      return () => document.addEventListener("keydown", callback);
    },
    [setQuery]
  );

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={search}
    />
  );
}

function SearchResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen1, setIsOpen1] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen1((open) => !open)}
      >
        {isOpen1 ? "–" : "+"}
      </button>
      {isOpen1 && children}
    </div>
  );
}

function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie onSelectMovie={onSelectMovie} movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MoviesDetails({
  watched,
  selectedId,
  onHandleCloseMovie,
  onHandleAddWached,
}) {
  const [movie, setMovie] = useState({});
  const [loading, setLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const countRef = useRef(0);

  //Check how many times a user clicks on a user Rating before making a final decision.
  useEffect(
    function () {
      if (userRating) countRef.current = countRef.current + 1;
    },
    [userRating]
  );

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
    imdbID,
  } = movie;

  const newWatchedMovie = {
    imdbID: selectedId,
    title,
    year,
    poster,
    imdbRating: Number(imdbRating),
    runtime: runtime,
    userRating,
    countRatingDecisions: countRef.current,
  };

  useEffect(
    function () {
      function callBack(e) {
        if (e.code === "Escape") {
          onHandleCloseMovie();
        }
      }

      return function () {
        document.removeEventListener("keydown", callBack);
      };
    },
    [onHandleCloseMovie]
  );

  useEffect(
    function () {
      async function getMovieDetails() {
        setLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?i=${selectedId}&apikey=${KEY}`
        );
        const data = await res.json();
        setMovie(data);
        setLoading(false);
      }
      getMovieDetails();
    },
    [selectedId]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;
      return function () {
        document.title = "usePopcorn";
      };
    },
    [title]
  );

  return (
    <div className="details ">
      {loading ? (
        <Loading />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onHandleCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>{released}</p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    imdbRating={imdbRating}
                    userRating={userRating}
                    maxStarRating={10}
                    color="yellow"
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button
                      className="btn-add"
                      onClick={() => onHandleAddWached(newWatchedMovie)}
                    >
                      Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You already watched this movie {watchedUserRating}
                  <span> ⭐️</span>
                </p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Staring {actors}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{Math.ceil(avgImdbRating)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{Math.ceil(avgUserRating)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchList({ onDeleteWatchedMovie, watched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          onDeleteWatchedMovie={onDeleteWatchedMovie}
          movie={movie}
          key={movie.imdbID}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDeleteWatchedMovie }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => onDeleteWatchedMovie(movie.imdbID)}
        >
          x
        </button>
      </div>
    </li>
  );
}

function Loading() {
  return <p style={{ fontSize: "28pt" }}>Loading....</p>;
}
