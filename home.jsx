// pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, addDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function Home() {
  const [songs, setSongs] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});
  const [comments, setComments] = useState({});

  const fetchSongs = async () => {
    const songSnapshot = await getDocs(collection(db, 'songs'));
    const songList = songSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setSongs(songList);
  };

  const fetchComments = (songId) => {
    const commentsRef = collection(db, 'songs', songId, 'comments');
    onSnapshot(commentsRef, (snapshot) => {
      const songComments = snapshot.docs.map(doc => doc.data());
      setComments(prev => ({ ...prev, [songId]: songComments }));
    });
  };

  const handleVote = async (id, change) => {
    const songRef = doc(db, 'songs', id);
    await updateDoc(songRef, { votes: change });
    fetchSongs();
  };

  const handleCommentSubmit = async (songId) => {
    const commentText = commentInputs[songId];
    if (!commentText) return;

    const commentRef = collection(db, 'songs', songId, 'comments');
    await addDoc(commentRef, { text: commentText, timestamp: Date.now() });
    setCommentInputs(prev => ({ ...prev, [songId]: '' }));
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    songs.forEach(song => fetchComments(song.id));
  }, [songs]);

  return (
    <div>
      <h1 className="text-2xl mb-4">My Songs</h1>
      {songs.map(song => (
        <div key={song.id} className="mb-6 border p-4 rounded-xl">
          <h2 className="text-xl">{song.title}</h2>
          {song.cover && <img src={song.cover} alt="cover" className="h-48 object-cover mb-2" />}
          <audio controls src={song.url} className="my-2 w-full" />
          <div className="flex gap-2 items-center">
            <button onClick={() => handleVote(song.id, song.votes + 1)} className="bg-green-200 px-2 py-1 rounded">Upvote</button>
            <button onClick={() => handleVote(song.id, song.votes - 1)} className="bg-red-200 px-2 py-1 rounded">Downvote</button>
            <span>Votes: {song.votes}</span>
          </div>
          <div className="mt-2 text-sm italic">Genre: {song.genre}</div>

          <div className="mt-4">
            <h3 className="text-lg font-bold">Comments:</h3>
            <div className="space-y-1">
              {(comments[song.id] || []).map((c, i) => (
                <div key={i} className="bg-gray-100 p-2 rounded">{c.text}</div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={commentInputs[song.id] || ''}
                onChange={e => setCommentInputs(prev => ({ ...prev, [song.id]: e.target.value }))}
                placeholder="Add a comment"
                className="border p-2 flex-grow"
              />
              <button onClick={() => handleCommentSubmit(song.id)} className="bg-blue-400 text-white px-3 rounded">
                Post
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
