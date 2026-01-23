const books = [];
let filteredBooks = null;
let bookToEdit = null;
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF-APP";

document.addEventListener("DOMContentLoaded", function () {
  const checkbox = document.getElementById("bookFormIsComplete");
  const rackType = document.getElementById("rackType");
  checkbox.addEventListener("change", function () {
    if (checkbox.checked) {
      rackType.innerText = "Selesai Dibaca";
    } else {
      rackType.innerText = "Belum Selesai Dibaca";
    }
  });

  function isStorageExist() {
    if (typeof Storage === undefined) {
      alert("Browser kamu tidak mendukung local storage");
      return false;
    }
    return true;
  }

  function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
      for (const book of data) {
        books.push(book);
      }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
  }

  function saveData() {
    if (isStorageExist()) {
      const parsed = JSON.stringify(books);
      localStorage.setItem(STORAGE_KEY, parsed);
      document.dispatchEvent(new Event(SAVED_EVENT));
    }
  }

  function generateId() {
    return Number(new Date());
  }

  function generateBookObject(id, title, author, year, isComplete) {
    return {
      id,
      title,
      author,
      year,
      isComplete,
    };
  }

  function addBook() {
    const bookTitle = document.getElementById("bookFormTitle").value;
    const bookAuthor = document.getElementById("bookFormAuthor").value;
    const bookYear = Number(document.getElementById("bookFormYear").value);
    const isComplete = document.getElementById("bookFormIsComplete").checked;

    const generatedID = generateId();
    const bookObject = generateBookObject(
      generatedID,
      bookTitle,
      bookAuthor,
      bookYear,
      isComplete,
    );

    books.push(bookObject);
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();
    backToStart();
  }

  const submitForm = document.getElementById("bookForm");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const submitId = event.submitter.id;
    if (submitId === "bookFormSubmit") {
      addBook();
      alert("Berhasil menambah buku!");
    } else if (submitId === "editBookSubmit") {
      editBook();
      alert("Berhasil edit buku!");
    }
  });

  function filterBooks() {
    const keyword = document.getElementById("searchBookTitle").value.trim();
    if (keyword === "") {
      filteredBooks = null;
    } else {
      filteredBooks = [];
      for (const book of books) {
        if (book.title.toLowerCase().includes(keyword.toLowerCase())) {
          filteredBooks.push(book);
        }
      }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
  }

  const searchSubmitForm = document.getElementById("searchBook");
  searchSubmitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    filterBooks();
  });

  function findBookById(bookId) {
    for (const book of books) {
      if (book.id === bookId) {
        return book;
      }
    }
    return null;
  }

  function moveBook(bookId, isComplete) {
    const bookTarget = findBookById(bookId);
    if (bookTarget == null) return;
    bookTarget.isComplete = isComplete;
    filteredBooks = null;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function findBookIndex(bookId) {
    for (const index in books) {
      if (books[index].id === bookId) {
        return index;
      }
    }

    return -1;
  }

  function removeBook(bookId) {
    const bookTarget = findBookIndex(bookId);
    if (bookTarget === -1) return;
    books.splice(bookTarget, 1);
    filteredBooks = null;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function editBookForm(prevBook) {
    const formTitle = document.getElementById("formTitle");
    formTitle.innerText = "Edit Buku";

    const bookTitle = document.getElementById("bookFormTitle");
    bookTitle.value = prevBook.title;

    const bookAuthor = document.getElementById("bookFormAuthor");
    bookAuthor.value = prevBook.author;

    const bookYear = document.getElementById("bookFormYear");
    bookYear.value = prevBook.year;

    const isCompleteCheckbox = document.getElementById("bookFormIsComplete");
    isCompleteCheckbox.checked = prevBook.isComplete;

    document.getElementById("bookFormSubmit").style.display = "none";
    document.getElementById("editBookSubmit").style.display = "block";
    document.getElementById("cancelEditBookSubmit").style.display = "block";

    bookToEdit = prevBook;
  }

  function backToStart() {
    bookToEdit = null;
    filteredBooks = null;
    document.getElementById("formTitle").innerText = "Tambah Buku Baru";
    document.getElementById("bookForm").reset();
    document.getElementById("searchBook").reset();
    document.getElementById("rackType").innerText = "Belum Selesai Dibaca";
    document.getElementById("bookFormSubmit").style.display = "block";
    document.getElementById("editBookSubmit").style.display = "none";
    document.getElementById("cancelEditBookSubmit").style.display = "none";
  }

  function editBook() {
    if (bookToEdit === null) return;
    const bookIndex = findBookIndex(bookToEdit.id);
    if (bookIndex === -1) return;
    books[bookIndex].title = document.getElementById("bookFormTitle").value;
    books[bookIndex].author = document.getElementById("bookFormAuthor").value;
    books[bookIndex].year = Number(
      document.getElementById("bookFormYear").value,
    );
    books[bookIndex].isComplete =
      document.getElementById("bookFormIsComplete").checked;

    filteredBooks = null;
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();

    backToStart();
  }

  function cancelEditBook() {
    backToStart();
    document.dispatchEvent(new Event(RENDER_EVENT));
  }

  document
    .getElementById("cancelEditBookSubmit")
    .addEventListener("click", function () {
      cancelEditBook();
    });

  function makeBookElement(bookObject) {
    const bookItemTittle = document.createElement("h3");
    bookItemTittle.setAttribute("data-testid", "bookItemTitle");
    bookItemTittle.innerText = bookObject.title;

    const bookItemAuthor = document.createElement("p");
    bookItemAuthor.setAttribute("data-testid", "bookItemAuthor");
    bookItemAuthor.innerText = "Penulis: " + bookObject.author;

    const bookItemYear = document.createElement("p");
    bookItemYear.setAttribute("data-testid", "bookItemYear");
    bookItemYear.innerText = "Tahun: " + bookObject.year;

    const buttonContainer = document.createElement("div");

    const completeButton = document.createElement("button");
    completeButton.setAttribute("data-testid", "bookItemIsCompleteButton");
    if (bookObject.isComplete) {
      completeButton.innerText = "Belum Selesai Dibaca";
      completeButton.style.border = "1px solid gray";
      completeButton.style.backgroundColor = "gray";
    } else {
      completeButton.innerText = "Selesai Dibaca";
      completeButton.style.border = "1px solid green";
      completeButton.style.backgroundColor = "green";
    }
    completeButton.addEventListener("click", function () {
      moveBook(bookObject.id, !bookObject.isComplete);
    });

    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Hapus Buku";
    deleteButton.setAttribute("data-testid", "bookItemDeleteButton");
    deleteButton.addEventListener("click", function () {
      removeBook(bookObject.id);
    });

    const editButton = document.createElement("button");
    editButton.innerText = "Edit Buku";
    editButton.setAttribute("data-testid", "bookItemEditButton");
    editButton.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
    editButton.addEventListener("click", function () {
      editBookForm(bookObject);
    });
    
    buttonContainer.append(completeButton, deleteButton, editButton);

    const container = document.createElement("div");
    container.setAttribute("data-bookid", `${bookObject.id}`);
    container.setAttribute("data-testid", "bookItem");
    container.append(
      bookItemTittle,
      bookItemAuthor,
      bookItemYear,
      buttonContainer,
    );

    return container;
  }

  document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
  });

  document.addEventListener(RENDER_EVENT, function () {
    const incompleteBookList = document.getElementById("incompleteBookList");
    incompleteBookList.innerHTML = "";

    const completeBookList = document.getElementById("completeBookList");
    completeBookList.innerHTML = "";

    let booksToRender = books;
    if (filteredBooks != null) {
      booksToRender = filteredBooks;
    }

    for (const book of booksToRender) {
      const bookElement = makeBookElement(book);
      if (!book.isComplete) {
        incompleteBookList.append(bookElement);
      } else {
        completeBookList.append(bookElement);
      }
    }
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});
