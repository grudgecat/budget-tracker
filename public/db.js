let db;
// create a new db request for a "BudgetDB" database.

const request = indexedDB.open("budgetDB", 1);

request.onupgradeneeded = function (event) {
  // create object store called "BudgetStore" and set autoIncrement to true
  const db = event.target.result;
  console.log(db);
  const budgetStore = db.createObjectStore("budgetInfo", {keyPath: 'transactId', autoIncrement: true});

};

request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  // log error here
};

function saveRecord(record) {
  // create a transaction on the pending db with readwrite access
  // access your pending object store
  // add record to your store with add method.
  const transaction = db.transaction(["budgetInfo"], "readwrite");
  const budgetInfoStore = transaction.objectStore('budgetInfo');
  
  budgetInfoStore.add(record)  //sent as 'transaction' object from SaveFunction .catch on errror
}

function checkDatabase() {
  // open a transaction on your pending db
  // access your pending object store
  // get all records from store and set to a variable
  const transaction = db.transaction(["budgetInfo"], "readwrite");
  const budgetInfoStore = transaction.objectStore('budgetInfo');

  const getAll = budgetStore.getAll();

  //can only interact with SERVER ROUTES
  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then(() => {
          // if successful, open a transaction on your pending db
          // access your pending object store
          // clear all items in your store
          const transaction = db.transaction(["budgetInfo"], "readwrite");
          const budgetInfoStore = transaction.objectStore('budgetInfo');

          budgetInfoStore.clear();
        });
    }
  };
}

// listen for app coming back online
window.addEventListener('online', checkDatabase);
