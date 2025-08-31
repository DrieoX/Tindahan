import SQLite from "react-native-sqlite-storage";

const SERVER_IP = "192.168.43.1:3000"; // IP of the server device (hotspot owner)

// Open local DB for server mode
const db = SQLite.openDatabase(
  { name: "tindahan.db", location: "default" },
  () => console.log("DB opened"),
  (err) => console.error("DB error", err)
);

const DataService = {
  async getInventory(userMode) {
    if (userMode === "server") {
      return new Promise((resolve, reject) => {
        db.transaction((tx) => {
          tx.executeSql(
            "SELECT * FROM inventory",
            [],
            (_, { rows }) => resolve(rows.raw()),
            (_, error) => reject(error)
          );
        });
      });
    } else {
      const res = await fetch(`http://${SERVER_IP}/inventory`);
      return res.json();
    }
  },

  async resupplyItem(userMode, id, qty) {
    if (userMode === "server") {
      return new Promise((resolve, reject) => {
        db.transaction((tx) => {
          tx.executeSql(
            "UPDATE inventory SET quantity = quantity + ? WHERE id = ?",
            [qty, id],
            (_, result) => resolve(result),
            (_, error) => reject(error)
          );
        });
      });
    } else {
      const res = await fetch(`http://${SERVER_IP}/resupply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, quantity: qty }),
      });
      return res.json();
    }
  },
};

export default DataService;
