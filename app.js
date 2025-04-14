import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getFirestore, collection, getDocs, updateDoc, doc, addDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyBEpLgHjLHSqaOj-UZhPIq4KuZkf5G4fHk",
  authDomain: "maady-music.firebaseapp.com",
  projectId: "maady-music",
  storageBucket: "maady-music.firebasestorage.app",
  messagingSenderId: "306006727539",
  appId: "1:306006727539:web:ea3dd2efe52a7f24464306",
  measurementId: "G-LGZ7XXP8Y3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const songsContainer = document.getElementById('songsContainer');
const commentInputs = {};

async function fetchSongs() {
  const snapshot = await getDocs(collection(db, 'songs'));
  songsContainer.innerHTML = '';

  snapshot.forEach(docSnap => {
    const song = { id: docSnap.id, ...docSnap.data() };
    renderSong(song);
    fetchComments(song.id);
  });
}

function renderSong(song) {
  const div = document.createElement('div');
  div.className = 'song';
  div.innerHTML = `
    <h2>${song.title}</h2>
    ${song.cover ? `<img src="${song.cover}" alt="cover" />` : ''}
    <audio controls src="${song.url}" class="my-2 w-full"></audio>
    <div>
      <button onclick="handleVote('${song.id}', ${song.votes + 1})">Upvote</button>
      <button onclick="handleVote('${song.id}', ${song.votes - 1})">Downvote</button>
      <span>Votes: <span id="votes-${song.id}">${song.votes}</span></span>
    </div>
    <div>Genre: ${song.genre}</div>
    <div class="comments" id="comments-${song.id}">
      <h3>Comments:</h3>
      <div id="commentList-${song.id}"></div>
      <div class="comment-box">
        <input type="text" id="input-${song.id}" placeholder="Add a comment" />
        <button onclick="submitComment('${song.id}')">Post</button>
      </div>
    </div>
  `;
  songsContainer.appendChild(div);
}

async function handleVote(id, newVotes) {
  const songRef = doc(db, 'songs', id);
  await updateDoc(songRef, { votes: newVotes });
  document.getElementById(`votes-${id}`).textContent = newVotes;
}

function fetchComments(songId) {
  const commentsRef = collection(db, 'songs', songId, 'comments');
  onSnapshot(commentsRef, snapshot => {
    const commentList = document.getElementById(`commentList-${songId}`);
    commentList.innerHTML = '';
    snapshot.forEach(doc => {
      const comment = doc.data();
      const p = document.createElement('div');
      p.textContent = comment.text;
      commentList.appendChild(p);
    });
  });
}

window.submitComment = async function(songId) {
  const input = document.getElementById(`input-${songId}`);
  const text = input.value.trim();
  if (!text) return;

  const commentRef = collection(db, 'songs', songId, 'comments');
  await addDoc(commentRef, { text, timestamp: Date.now() });
  input.value = '';
};

window.handleVote = handleVote;

fetchSongs();
