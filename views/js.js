function saveSelectedBooks() {
  const userId = document.getElementById('userId-saved').value;
  const bookItemDtos = document.getElementById('bookitemdtos').value;

  fetch(`/books/selected/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bookItemDtos: [bookItemDtos] }),
  })
    .then((response) => response.json())
    .then((data) => {
      document.getElementById('responseDisplay').innerHTML = JSON.stringify(
        data,
        null,
        2,
      );
    })
    .catch((error) => {
      console.error('Error:', error);
      alert(error);
    });
}

function createCommentOnBook() {
  const userId = document.getElementById('userId-createcomment').value;
  const bookId = document.getElementById('bookId-createcomment').value;
  const content = document.getElementById('content-createcomment').value;
  fetch(`/books/${bookId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ comment: { content, userId, bookId } }),
  })
    .then((response) => response.json())
    .then((data) => {
      document.getElementById('responseDisplay-createcomment').innerHTML =
        JSON.stringify(data, null, 2);
    })
    .catch((error) => {
      console.error('Error:', error);
      alert(error);
    });
}

function deleteCommentOnBook() {
  const bookId = document.getElementById('bookId-deletecomment').value;
  const commentId = document.getElementById('commentId-deletecomment').value;

  fetch(`books/${bookId}/comments/${commentId}`, {
    method: 'DELETE',
  })
    .then((response) => response.json())
    .then((data) => {
      document.getElementById('responseDisplay-commentdelete').innerHTML =
        JSON.stringify(data, null, 2);
    })
    .catch((error) => {
      console.error('Error:', error);
      alert(error);
    });
}

function deleteSelectedBookByBookSeq() {
  const selectedBookSeq = document.getElementById(
    'selectedBookSeq-selected-delete',
  ).value;
  fetch(`books/selected/${selectedBookSeq}`, { method: 'DELETE' })
    .then((response) => response.json())
    .then((data) => {
      document.getElementById('responseDisplay-deleteselected').innerHTML =
        JSON.stringify(data, null, 2);
    })
    .catch((error) => {
      console.error('Error:', error);
      alert(error);
    });
}

function updateCommentOnBook() {
  const bookId = document.getElementById('bookId-updatecomment').value;
  const commentId = document.getElementById('commentId-updatecomment').value;
  const content = document.getElementById('content-updatecomment').value;
  fetch(`books/${bookId}/comments/${commentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ comment: { content } }),
  })
    .then((response) => response.json())
    .then(
      (data) =>
        (document.getElementById('responseDisplay-updatecomment').innerHTML =
          JSON.stringify(data, null, 2)),
    )
    .catch((error) => {
      console.error('Error:', error);
    });
}

function goToSavedBook() {
  const userId = document.getElementById('userId-saved').value;
  const bookItemDtos = document.getElementById('bookitemdtos').value;
  const serviceUrl = '{{serviceUrl}}';
  window.location.href = `${serviceUrl}/books/selected/${userId}`;
}

function goToSelectedBooks() {
  const userId = document.getElementById('userId-selected').value;
  fetch(`books/selected/${userId}`)
    .then((response) => response.json())
    .then((data) => {
      document.getElementById('responseDisplay-selectedbook').innerHTML = data;
    })
    .catch((error) => {
      console.error('Error:', error);
      alert(error);
    });
}

function updateLikes() {
  const bookId = document.getElementById('bookId-likes').value;
  const userId = document.getElementById('userId-likes').value;

  fetch(`books/${bookId}/likes/${userId}`, {
    method: 'PUT',
  })
    .then((response) => response.json())
    .then((data) => {
      document.getElementById('responseDisplay-updatelikes').innerHTML =
        JSON.stringify(data, null, 2);
    })
    .catch((error) => {
      console.error('Error:', error);
      alert(error);
    });
}

function saveSelectedBooks() {
  const userId = document.getElementById('userId-saved').value;
  const bookItems = document.getElementById('bookitemdtos').value;
  fetch(`/books/selected/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: bookItems,
  })
    .then((response) => response.json())
    .then(
      (data) =>
        (document.getElementById('responseDisplay-savedbook').innerHTML =
          JSON.stringify(data, null, 2)),
    )
    .catch((error) => {
      console.error('Error:', error);
      alert(error);
    });
}

function registerUser() {
  const user = document.getElementById('user-create').value;
  fetch(`users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: user,
  })
    .then((response) => response.json())
    .then(
      (data) =>
        (document.getElementById('responseDisplay-usercreate').innerHTML =
          JSON.stringify(data, null, 2)),
    )
    .catch((error) => {
      console.error('Error:', error);
    });
}
