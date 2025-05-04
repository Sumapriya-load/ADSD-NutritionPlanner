import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { saveAs } from "file-saver";

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [sortKey, setSortKey] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [loggedFoods, setLoggedFoods] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/food/search?query=");
        const data = await res.json();
        setAllItems(data);
      } catch (err) {
        console.error("Failed to load suggestions", err);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    const filtered = allItems.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
    const unique = [...new Set(filtered.map((item) => item.name))].slice(0, 5);
    setSuggestions(unique);
  }, [query, allItems]);

  const handleSearch = async (q = query) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/food/search?query=${q}`);
      const data = await res.json();
      setResults(data);
      setSuggestions([]);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const handleLog = (item) => {
    setLoggedFoods((prev) => [...prev, item]);
  };

  const handleDownload = () => {
    const header = "Name,Calories (kcal),Protein (g),Carbs (g),Fat (g)\n";
    const rows = loggedFoods.map(
      (f) => `"${f.name}",${f.calories},${f.protein},${f.carbs},${f.fat}`
    );
    const csv = header + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `logged_foods_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const sortedResults = [...results].sort((a, b) => {
    if (!sortKey) return 0;
    if (typeof a[sortKey] === "string") {
      return sortAsc
        ? a[sortKey].localeCompare(b[sortKey])
        : b[sortKey].localeCompare(a[sortKey]);
    }
    return sortAsc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey];
  });

  const COLORS = ["#00C49F", "#FFBB28", "#FF4444"];

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>🥗 Smart Diet & Nutrition Planner</h1>
      <div style={{ position: "relative", marginBottom: "2rem" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          placeholder="Search food..."
          style={styles.input}
        />
        <button onClick={() => handleSearch()} style={styles.searchButton}>
          Search
        </button>
        {suggestions.length > 0 && (
          <ul style={styles.suggestionBox}>
            {suggestions.map((sug, idx) => (
              <li
                key={idx}
                onClick={() => {
                  setQuery(sug);
                  handleSearch(sug);
                }}
                style={styles.suggestionItem}
              >
                {sug}
              </li>
            ))}
          </ul>
        )}
      </div>

      {sortedResults.length > 0 ? (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["name", "calories", "protein", "carbs", "fat"].map((key) => (
                  <th key={key} onClick={() => handleSort(key)} style={styles.th}>
                    {key === "name"
                      ? "Name"
                      : key === "calories"
                      ? "Calories (kcal)"
                      : key.charAt(0).toUpperCase() + key.slice(1) + " (g)"}
                    {sortKey === key ? (sortAsc ? " ▲" : " ▼") : ""}
                  </th>
                ))}
                <th style={styles.th}>Log</th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.map((item) => (
                <tr key={item.id} style={styles.tr}>
                  <td style={styles.td}>{item.name}</td>
                  <td style={styles.td}>{item.calories} kcal</td>
                  <td style={styles.td}>{item.protein} g</td>
                  <td style={styles.td}>{item.carbs} g</td>
                  <td style={styles.td}>{item.fat} g</td>
                  <td style={styles.td}>
                    <button onClick={() => handleLog(item)}>Log</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ fontStyle: "italic", color: "#666" }}>No results found.</p>
      )}

      {loggedFoods.length > 0 && (
        <div style={{ marginTop: "3rem" }}>
          <h2>
            <span role="img" aria-label="chart">
              📊
            </span>{" "}
            Nutritional Summary (Logged)
          </h2>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <PieChart width={300} height={300}>
              <Pie
                dataKey="value"
                data={[
                  { name: "Protein (g)", value: loggedFoods.reduce((a, b) => a + b.protein, 0) },
                  { name: "Carbs (g)", value: loggedFoods.reduce((a, b) => a + b.carbs, 0) },
                  { name: "Fat (g)", value: loggedFoods.reduce((a, b) => a + b.fat, 0) },
                ]}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {COLORS.map((c, i) => (
                  <Cell key={i} fill={c} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
            <BarChart width={300} height={300} data={loggedFoods}>
              <XAxis dataKey="name" hide />
              <YAxis />
              <Tooltip />
              <Bar dataKey="calories" fill="#4287f5" name="Calories (kcal)" />
            </BarChart>
          </div>
          <button
            style={{ marginTop: "1rem", padding: "0.6rem 1rem" }}
            onClick={handleDownload}
          >
            📥 Download CSV
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Segoe UI', sans-serif",
    padding: "2rem",
    textAlign: "center",
    background: "#f2f5f7",
    minHeight: "100vh",
  },
  heading: {
    fontSize: "2.2rem",
    marginBottom: "2rem",
    color: "#1f2937",
  },
  input: {
    padding: "0.7rem 1rem",
    width: "260px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "1rem",
  },
  searchButton: {
    padding: "0.7rem 1.2rem",
    marginLeft: "10px",
    fontSize: "1rem",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  suggestionBox: {
    position: "absolute",
    top: "45px",
    left: "0",
    width: "260px",
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    listStyle: "none",
    margin: 0,
    padding: 0,
    zIndex: 999,
    borderRadius: "4px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  suggestionItem: {
    padding: "0.6rem 1rem",
    cursor: "pointer",
    borderBottom: "1px solid #eee",
  },
  tableWrapper: {
    overflowX: "auto",
    marginTop: "1rem",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#fff",
    boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
    borderRadius: "8px",
    overflow: "hidden",
  },
  th: {
    backgroundColor: "#f3f4f6",
    padding: "1rem",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "1rem",
    borderBottom: "1px solid #ddd",
  },
  tr: {
    transition: "background 0.2s",
  },
  td: {
    padding: "1rem",
    borderBottom: "1px solid #eee",
    textAlign: "center",
  },
};

export default App;
