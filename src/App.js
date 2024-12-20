import { useEffect, useRef, useState } from "react";
import StarRating from "./starRating";
import { useMovies } from "./useMovies";
import { useLocaleStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
function Search({ query, setQuery }) {
  const inputEle = useRef(null);
  useEffect(
    function () {
      function callback(e) {
        if (e.code === "Enter") {
          if (document.activeElement === inputEle.current) return;
          inputEle.current.focus();
          setQuery("");
        }
      }
      document.addEventListener("keydown", callback);
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
      ref={inputEle}
    />
  );
}

function Navbar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

function Loading() {
  return <p className="loader">Loading...</p>;
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}
function Results({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function MovieDetails({
  selectedId,
  onCLoseMovie,
  onAddWatched,
  handleClose,
  watched,
}) {
  const [Movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");
  const countRef = useRef(0);
  useEffect(() => {
    if (userRating) countRef.current = countRef.current + 1;
  }, [userRating]);
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating: imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = Movie;
  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split("").at(0)),
      userRating: userRating,
      countRatingDecisions: countRef.current,
    };
    onAddWatched(newWatchedMovie);
    onCLoseMovie();
  }
  const KEY = "f84fc31d";
  useKey("Escape", onCLoseMovie);

  useEffect(
    function () {
      async function getMoviesData() {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );
        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }
      getMoviesData();
    },
    [selectedId]
  );

  useEffect(() => {
    if (!title) return;
    document.title = `Movie | ${title}`;
    return () => {
      document.title = "usePopcorn";
    };
  }, [title]);

  return (
    <div className="details">
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCLoseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${Movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDB Rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <StarRating
                  maxRating={10}
                  size="24"
                  setExternalRating={setUserRating}
                />
              ) : (
                <p>You have rated the movie {watchedUserRating}</p>
              )}
              {userRating > 0 && !isWatched && (
                <button className="btn-add" onClick={handleAdd}>
                  + Add
                </button>
              )}
            </div>

            <p>
              <em>{plot}</em>
            </p>
            <p>Starring: {actors}</p>
            <p>Directed By {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <li key={movie.imdbID} onClick={() => onSelectMovie(movie.imdbID)}>
          <img src={movie.Poster} alt={`${movie.Title} poster`} />
          <h3>{movie.Title}</h3>
          <div>
            <p>
              <span>🗓</span>
              <span>{movie.Year}</span>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}
function Summary({ watched }) {
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
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}
function WatchedMovie({ movie, onDeleteWatched, onClickShowDetails }) {
  return (
    <li key={movie.imdbID} onClick={() => onClickShowDetails(movie.imdbID)}>
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
          onClick={() => onDeleteWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}

function WatchedList({ watched, onDeleteWatched, onClickShowDetails }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteWatched={onDeleteWatched}
          onClickShowDetails={onClickShowDetails}
        />
      ))}
    </ul>
  );
}

// function WatchedBox() {
//   const [watched, setWatched] = useState(tempWatchedData);

//   const [isOpen2, setIsOpen2] = useState(true);

//   const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
//   const avgUserRating = average(watched.map((movie) => movie.userRating));
//   const avgRuntime = average(watched.map((movie) => movie.runtime));
//   return (
//     <div className="box">
//       <button
//         className="btn-toggle"
//         onClick={() => setIsOpen2((open) => !open)}
//       >
//         {isOpen2 ? "–" : "+"}
//       </button>
//       {isOpen2 && (

//       )}
//     </div>
//   );
//}
function Main({ children }) {
  return <main className="main">{children}</main>;
}
function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>❌</span>
      {message}
    </p>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [selectWatchedID, setSelectWatchedID] = useState(null);
  const { movies, isLoading, error } = useMovies(query);

  const [watched, setWatched] = useLocaleStorageState([], "watched");
  // const [watched, setWatched] = useState(function () {

  //   const storedValue = localStorage.getItem("watched");
  //   return JSON.parse(storedValue);
  // });

  /// this function is considered only once in the initial render .used whenever the initial value of a state depends on some computation
  // We can also do this by using a effect which only executes only after initial render
  // const [watched, setWatched] = useState(() => {
  //   const storedValue = localStorage.getItem("watched");
  //   return storedValue ? JSON.parse(storedValue) : []; // Fallback to an empty array
  // });

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }
  function handleClose() {
    setSelectedId(null);
    setSelectWatchedID(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
    //localStorage.setItem("watched", JSON.stringify([...watched, movie]));
  }
  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }
  function handleShowWatchedDetails(id) {
    setSelectWatchedID(id);
  }

  return (
    <>
      <Navbar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <Results movies={movies} />
      </Navbar>
      <Main>
        {/* <Box elements={<MovieList movies={movies} />} /> */}
        <Box>
          {/* {isLoading ? (
            <Loading />
          ) : (
            <MovieList movies={movies} key={movies.imdbID} />
          )} */}
          {isLoading && <Loading />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCLoseMovie={handleClose}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : selectWatchedID ? (
            <MovieDetails
              selectedId={selectWatchedID}
              onCLoseMovie={handleClose}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <Summary watched={watched} />
              <WatchedList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
                onClickShowDetails={handleShowWatchedDetails}
              />
            </>
          )}
        </Box>
        {/* <Box
          elements={
            <>
              <Summary watched={watched} />
              <WatchedList watched={watched} />
            </>
          }
        /> */}
      </Main>
    </>
  );
}
